const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passwordValidator = require("password-validator");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const config = require("../config");
const JWT_MAX_AGE = "6m";

let User;
try {
  User = require("../models/user");
} catch (e) {
  console.log("⚠️ Attention: Modèle Mongoose non trouvé, fonctionnement JSON uniquement.");
}

const schema = new passwordValidator();
schema
  .is().min(8)
  .is().max(100)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().not().spaces();

let users = [];

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'pokedex@ethereal.email',
    pass: '3j8q4f1uF1sq3q4c1d'
  }
});
console.log("✅ SERVICE MAIL PRÊT (Config Statique)");

async function safeMongoSave(action) {
  if (!User) return;
  try {
    await action();
  } catch (e) {
    console.error("⚠️ Erreur MongoDB (Ignorée):", e.message);
  }
}

function getUserFromToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send({ ok: false, code: "NO_TOKEN", message: "Token manquant" });
  try {
    const decoded = jwt.verify(token, config.SECRET);
    const user = users.find(u => u._id === decoded._id);
    if (!user) return res.status(401).send({ ok: false, code: "USER_NOT_FOUND", message: "Utilisateur non trouvé" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send({ ok: false, code: "INVALID_TOKEN", message: "Token invalide" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.email !== 'admin@admin') return res.status(403).send({ ok: false, code: "FORBIDDEN", message: "Accès refusé" });
  next();
}

router.post("/signup", async (req, res) => {
  let { email, password, first_name, last_name } = req.body;
  email = (email || "").trim().toLowerCase();

  if (!email || !password || !first_name || !last_name)
    return res.status(400).send({ ok: false, code: "MISSING_FIELDS", message: "All fields are required" });

  if (!schema.validate(password))
    return res.status(400).send({ ok: false, code: "INVALID_PASSWORD", message: "Password invalid" });

  try {
    const existingUser = users.find(u => u.email === email);
    if (existingUser) return res.status(409).send({ ok: false, code: "USER_EXISTS", message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      _id: Date.now().toString(),
      email,
      password: hashedPassword,
      first_name,
      last_name,
      last_login_at: new Date(),
      captured: [],
    };

    users.push(user);

    await safeMongoSave(() => User.create(user));

    const token = jwt.sign({ _id: user._id }, config.SECRET, { expiresIn: JWT_MAX_AGE });
    return res.status(201).send({ ok: true, token, data: { ...user, password: undefined } });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ ok: false, code: "SERVER_ERROR" });
  }
});

router.post("/signin", async (req, res) => {
  let { password, email } = req.body;
  email = (email || "").trim().toLowerCase();

  if (!email || !password) return res.status(400).send({ ok: false, code: "MISSING_FIELDS" });

  try {
    let user = users.find(u => u.email === email);

    if (!user && User) {
      try {
        const mongoUser = await User.findOne({ email: email });
        if (mongoUser) {
          user = mongoUser.toObject();
          users.push(user);
        }
      } catch (e) {
        console.error("⚠️ Erreur lecture MongoDB:", e.message);
      }
    }

    if (!user) return res.status(401).send({ ok: false, code: "INVALID_USER" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send({ ok: false, code: "INVALID_USER" });

    user.last_login_at = new Date();

    await safeMongoSave(() => User.updateOne({ _id: user._id }, { last_login_at: user.last_login_at }));

    const token = jwt.sign({ _id: user._id }, config.SECRET, { expiresIn: JWT_MAX_AGE });
    return res.status(200).send({ ok: true, token, data: { ...user, password: undefined } });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ ok: false, code: "SERVER_ERROR" });
  }
});

router.put("/:id", (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send({ ok: false, code: "NO_TOKEN" });
  try {
    const decoded = jwt.verify(token, config.SECRET);
    req.user = { _id: decoded._id };
    next();
  } catch (err) { return res.status(401).send({ ok: false, code: "INVALID_TOKEN" }); }
}, async (req, res) => {
  try {
    const user = users.find(u => u._id === req.params.id);
    if (!user) return res.status(404).send({ ok: false, code: "USER_NOT_FOUND" });
    if (req.user._id !== req.params.id) return res.status(403).send({ ok: false, code: "FORBIDDEN" });

    const { first_name, last_name, password } = req.body;

    const updateData = {};

    if (first_name) { user.first_name = first_name; updateData.first_name = first_name; }
    if (last_name) { user.last_name = last_name; updateData.last_name = last_name; }

    if (password) {
      if (!schema.validate(password)) return res.status(400).send({ ok: false, code: "INVALID_PASSWORD" });
      user.password = await bcrypt.hash(password, 10);
      updateData.password = user.password;
    }

    if (Object.keys(updateData).length > 0) {
      await safeMongoSave(() => User.updateOne({ _id: req.params.id }, updateData));
    }

    res.status(200).send({ ok: true, data: { ...user, password: undefined } });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: "SERVER_ERROR" });
  }
}
);

router.get("/captured", (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send({ ok: false, code: "NO_TOKEN" });
  try {
    const decoded = jwt.verify(token, config.SECRET);
    req.user = { _id: decoded._id };
    next();
  } catch (err) { return res.status(401).send({ ok: false, code: "INVALID_TOKEN" }); }
}, (req, res) => {
  try {
    const user = users.find(u => u._id === req.user._id);
    if (!user) return res.status(404).send({ ok: false, code: "USER_NOT_FOUND" });
    res.status(200).send({ ok: true, captured: user.captured || [] });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: "SERVER_ERROR" });
  }
});

router.post("/capture", (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send({ ok: false, code: "NO_TOKEN" });
  try {
    const decoded = jwt.verify(token, config.SECRET);
    req.user = { _id: decoded._id };
    next();
  } catch (err) { return res.status(401).send({ ok: false, code: "INVALID_TOKEN" }); }
}, async (req, res) => {
  try {
    const { pokemonId, capture } = req.body;
    if (pokemonId === undefined || capture === undefined) return res.status(400).send({ ok: false, code: "MISSING_FIELDS" });
    const user = users.find(u => u._id === req.user._id);
    if (!user) return res.status(404).send({ ok: false, code: "USER_NOT_FOUND" });

    if (!user.captured) user.captured = [];
    if (capture) {
      if (!user.captured.includes(pokemonId)) user.captured.push(pokemonId);
    } else {
      user.captured = user.captured.filter(id => id !== pokemonId);
    }

    await safeMongoSave(() => User.updateOne({ _id: user._id }, { captured: user.captured }));

    res.status(200).send({ ok: true, captured: user.captured });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: "SERVER_ERROR" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send({ ok: false, message: "Email requis" });

  try {
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return res.status(404).send({ ok: false, message: "Utilisateur introuvable" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = Date.now() + 15 * 60 * 1000;

    await safeMongoSave(() => User.updateOne({ _id: user._id }, { resetCode: code, resetCodeExpires: user.resetCodeExpires }));

    console.log(`🔑 CODE GÉNÉRÉ (BACKUP CONSOLE) : ${code}`);

    try {
      let info = await transporter.sendMail({
        from: '"Pokédex Support" <support@pokedex.com>',
        to: user.email,
        subject: "Code de réinitialisation",
        text: `Votre code est : ${code}`,
        html: `<b>Votre code est : ${code}</b>`,
      });
      const previewURL = nodemailer.getTestMessageUrl(info);
      console.log("🔗 LIEN POUR LIRE LE MAIL : " + previewURL);

      res.status(200).send({ ok: true, message: "Code envoyé" });
    } catch (mailError) {
      res.status(200).send({
        ok: true,
        message: "Mail bloqué par le réseau, mais CODE DISPO DANS LA CONSOLE SERVEUR"
      });
    }

  } catch (error) {
    console.error("ERREUR CRITIQUE:", error);
    res.status(500).send({ ok: false, message: "Erreur serveur" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).send({ ok: false, message: "Données incomplètes" });
  }

  if (!schema.validate(newPassword)) {
    return res.status(400).send({ ok: false, message: "Mot de passe trop faible" });
  }

  try {
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return res.status(404).send({ ok: false, message: "Utilisateur introuvable" });

    if (!user.resetCode || String(user.resetCode) !== String(code)) {
      return res.status(400).send({ ok: false, message: "Code invalide" });
    }

    if (Date.now() > user.resetCodeExpires) {
      return res.status(400).send({ ok: false, message: "Code expiré" });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    delete user.resetCode;
    delete user.resetCodeExpires;

    await safeMongoSave(() => User.updateOne(
      { _id: user._id },
      { password: user.password, $unset: { resetCode: "", resetCodeExpires: "" } }
    ));

    res.status(200).send({ ok: true, message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "Erreur serveur" });
  }
});

router.get("/admin/users", getUserFromToken, requireAdmin, (req, res) => {
  const usersWithoutPassword = users.map(u => ({ ...u, password: undefined }));
  res.status(200).send({ ok: true, data: usersWithoutPassword });
});

router.put("/admin/users/:id", getUserFromToken, requireAdmin, async (req, res) => {
  const { email, first_name, last_name, password } = req.body;
  try {
    const user = users.find(u => u._id === req.params.id);
    if (!user) return res.status(404).send({ ok: false, code: "USER_NOT_FOUND" });

    const updateData = {};

    if (email && email !== user.email) {
      const existing = users.find(u => u.email === email && u._id !== req.params.id);
      if (existing) return res.status(409).send({ ok: false, code: "EMAIL_EXISTS" });
      user.email = email.trim().toLowerCase();
      updateData.email = user.email;
    }

    if (first_name) { user.first_name = first_name; updateData.first_name = first_name; }
    if (last_name) { user.last_name = last_name; updateData.last_name = last_name; }

    if (password) {
      if (!schema.validate(password)) return res.status(400).send({ ok: false, code: "INVALID_PASSWORD" });
      user.password = await bcrypt.hash(password, 10);
      updateData.password = user.password;
    }

    if (Object.keys(updateData).length > 0) {
      await safeMongoSave(() => User.updateOne({ _id: user._id }, updateData));
    }

    res.status(200).send({ ok: true, data: { ...user, password: undefined } });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: "SERVER_ERROR" });
  }
});

router.post("/admin/delete/:id", getUserFromToken, requireAdmin, async (req, res) => {
  const targetId = req.params.id.trim();
  console.log(`[DELETE via POST] Reçu demande pour ID: ${targetId}`);

  try {
    const userToDelete = users.find(u => String(u._id) === String(targetId));
    if (!userToDelete) return res.status(404).send({ ok: false, code: "USER_NOT_FOUND" });
    if (userToDelete.email === 'admin@admin') return res.status(403).send({ ok: false, code: "CANNOT_DELETE_ADMIN" });

    const index = users.findIndex(u => String(u._id) === String(targetId));
    if (index > -1) {
      users.splice(index, 1);

      await safeMongoSave(() => User.deleteOne({ _id: targetId }));

      console.log(`[DELETE] Succès !`);
      return res.status(200).send({ ok: true, message: "Utilisateur supprimé avec succès" });
    } else {
      return res.status(500).send({ ok: false, code: "DELETE_ERROR" });
    }
  } catch (error) {
    console.log('[DELETE] Erreur Serveur:', error);
    res.status(500).send({ ok: false, code: "SERVER_ERROR" });
  }
});

module.exports = router;