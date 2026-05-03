const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const doctorAuth = require('../middleware/doctorAuth');
const transporter = require('../utils/mailer');

// Helper: send patient email
async function notifyPatient(appointment, subject, html) {
  try {
    await transporter.sendMail({
      from: `"ClinicUrgence" <${process.env.EMAIL_FROM}>`,
      to: appointment.email,
      subject,
      html
    });
  } catch (e) {
    console.error('Mail error:', e.message);
  }
}

// GET doctor's appointments
router.get('/', doctorAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { doctorId: req.doctor.doctorId };
    if (status) filter.status = status;
    const appointments = await Appointment.find(filter).sort({ appointmentDate: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET upcoming appointments for doctor
router.get('/upcoming', doctorAuth, async (req, res) => {
  try {
    const now = new Date(); now.setHours(0,0,0,0);
    const appointments = await Appointment.find({
      doctorId: req.doctor.doctorId,
      appointmentDate: { $gte: now },
      status: { $in: ['confirmed', 'postponed'] }
    }).sort({ appointmentDate: 1, appointmentTime: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT postpone appointment
router.put('/:id/postpone', doctorAuth, async (req, res) => {
  try {
    const { postponedDate, postponedTime, postponeReason } = req.body;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctor.doctorId },
      { status: 'postponed', postponedDate, postponedTime, postponeReason },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const newDate = new Date(postponedDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    await notifyPatient(appointment,
      ` Rendez-vous reporté — ${appointment.ticketNumber}`,
      `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#0a3d27;">ClinicUrgence</h2>
        <p>Bonjour <strong>${appointment.firstName} ${appointment.lastName}</strong>,</p>
        <p>Votre rendez-vous <strong>${appointment.ticketNumber}</strong> a été <strong style="color:#d97706;">reporté</strong> par ${req.doctor.name}.</p>
        <div style="background:#fffbeb;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #f59e0b;">
          <p style="margin:6px 0;"><strong>Nouvelle date :</strong> ${newDate}</p>
          <p style="margin:6px 0;"><strong>Nouvel horaire :</strong> ${postponedTime}</p>
          ${postponeReason ? `<p style="margin:6px 0;"><strong>Raison :</strong> ${postponeReason}</p>` : ''}
        </div>
        <p style="color:#4b5563;font-size:0.9rem;">Pour toute question, contactez-nous au <strong>+216 71 234 567</strong>.</p>
        <p style="color:#9ca3af;font-size:0.78rem;margin-top:24px;">12 Rue de la Santé, Tunis 1002</p>
      </div>`
    );

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT cancel appointment (by doctor)
router.put('/:id/cancel', doctorAuth, async (req, res) => {
  try {
    const { cancelReason } = req.body;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctor.doctorId },
      { status: 'cancelled', cancelReason },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    await notifyPatient(appointment,
      `❌ Rendez-vous annulé — ${appointment.ticketNumber}`,
      `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#0a3d27;">ClinicUrgence</h2>
        <p>Bonjour <strong>${appointment.firstName} ${appointment.lastName}</strong>,</p>
        <p>Votre rendez-vous <strong>${appointment.ticketNumber}</strong> a été <strong style="color:#e53e3e;">annulé</strong> par ${req.doctor.name}.</p>
        ${cancelReason ? `<div style="background:#fff5f5;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #e53e3e;"><p><strong>Raison :</strong> ${cancelReason}</p></div>` : ''}
        <p style="color:#4b5563;">Pour reprendre un rendez-vous, appelez le <strong>+216 71 234 567</strong>.</p>
        <p style="color:#9ca3af;font-size:0.78rem;margin-top:24px;">12 Rue de la Santé, Tunis 1002</p>
      </div>`
    );

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT mark as done + issue documents
router.put('/:id/done', doctorAuth, async (req, res) => {
  try {
    const { ordonnance, certificate, report } = req.body;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctor.doctorId },
      { status: 'done', ordonnance, certificate, report },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const date = new Date(appointment.appointmentDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

    // Build document sections
    let docSections = '';

    if (ordonnance && ordonnance.medicines && ordonnance.medicines.length > 0) {
      const meds = ordonnance.medicines.map(m =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">${m.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${m.dosage}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${m.frequency}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${m.duration}</td>
        </tr>`
      ).join('');

      docSections += `
        <div style="margin-top:28px;padding:24px;border:2px solid #1f9d5f;border-radius:12px;">
          <h3 style="color:#0a3d27;margin-top:0;font-size:1.1rem;"> Ordonnance Médicale</h3>
          <table style="width:100%;border-collapse:collapse;font-size:0.88rem;">
            <thead>
              <tr style="background:#eaf9f0;">
                <th style="padding:8px 12px;text-align:left;">Médicament</th>
                <th style="padding:8px 12px;text-align:left;">Dosage</th>
                <th style="padding:8px 12px;text-align:left;">Fréquence</th>
                <th style="padding:8px 12px;text-align:left;">Durée</th>
              </tr>
            </thead>
            <tbody>${meds}</tbody>
          </table>
          ${ordonnance.notes ? `<p style="margin-top:12px;font-size:0.85rem;color:#4b5563;"><strong>Notes :</strong> ${ordonnance.notes}</p>` : ''}
          <p style="text-align:right;margin-top:20px;font-size:0.85rem;color:#374151;">
            <strong>${req.doctor.name}</strong><br/>
            <em>Médecin — ClinicUrgence</em><br/>
            Tunis, le ${today}
          </p>
        </div>`;
    }

    if (certificate) {
      const certTypes = { work: 'Arrêt de travail', study: "Dispense d'études", sports: 'Dispense de sport', other: 'Certificat médical' };
      const startDate = certificate.startDate ? new Date(certificate.startDate).toLocaleDateString('fr-FR') : today;
      docSections += `
        <div style="margin-top:28px;padding:24px;border:2px solid #3b82f6;border-radius:12px;">
          <h3 style="color:#1e3a8a;margin-top:0;font-size:1.1rem;"> ${certTypes[certificate.type] || 'Certificat Médical'}</h3>
          <p style="color:#374151;">Je soussigné(e) <strong>${req.doctor.name}</strong>, certifie avoir examiné le patient
          <strong>${appointment.firstName} ${appointment.lastName}</strong> ce jour.</p>
          <p style="color:#374151;">En raison de son état de santé, il/elle est dans l'incapacité d'exercer ses activités
          pendant <strong>${certificate.daysOff} jour(s)</strong>, à compter du <strong>${startDate}</strong>.</p>
          ${certificate.reason ? `<p style="color:#374151;"><strong>Motif :</strong> ${certificate.reason}</p>` : ''}
          ${certificate.notes ? `<p style="color:#374151;"><strong>Notes :</strong> ${certificate.notes}</p>` : ''}
          <p style="text-align:right;margin-top:20px;font-size:0.85rem;color:#374151;">
            <strong>${req.doctor.name}</strong><br/>
            <em>Médecin — ClinicUrgence</em><br/>
            Tunis, le ${today}
          </p>
        </div>`;
    }

    if (report) {
      docSections += `
        <div style="margin-top:28px;padding:24px;border:2px solid #8b5cf6;border-radius:12px;">
          <h3 style="color:#4c1d95;margin-top:0;font-size:1.1rem;"> Compte Rendu Médical</h3>
          ${report.diagnosis ? `<p><strong>Diagnostic :</strong> ${report.diagnosis}</p>` : ''}
          ${report.findings ? `<p><strong>Observations :</strong> ${report.findings}</p>` : ''}
          ${report.recommendations ? `<p><strong>Recommandations :</strong> ${report.recommendations}</p>` : ''}
          ${report.followUp ? `<p><strong>Suivi :</strong> ${report.followUp}</p>` : ''}
          <p style="text-align:right;margin-top:20px;font-size:0.85rem;color:#374151;">
            <strong>${req.doctor.name}</strong><br/>
            <em>Médecin — ClinicUrgence</em><br/>
            Tunis, le ${today}
          </p>
        </div>`;
    }

    await notifyPatient(appointment,
      ` Consultation terminée — ${appointment.ticketNumber}`,
      `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#0a3d27;">ClinicUrgence</h2>
        <p>Bonjour <strong>${appointment.firstName} ${appointment.lastName}</strong>,</p>
        <p>Votre consultation du <strong>${date}</strong> avec <strong>${req.doctor.name}</strong> est terminée.</p>
        <p>Veuillez trouver ci-dessous vos documents médicaux :</p>
        ${docSections || '<p style="color:#6b7280;font-style:italic;">Aucun document émis lors de cette consultation.</p>'}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;"/>
        <p style="color:#9ca3af;font-size:0.78rem;text-align:center;">
          ClinicUrgence — 12 Rue de la Santé, Tunis 1002 — +216 71 234 567<br/>
          Cet email a été envoyé automatiquement depuis notre système de gestion médicale.
        </p>
      </div>`
    );

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;