const crypto = require('crypto');
const Prescription = require('../Model/Prescription');

// Create a new prescription
const createPrescription = async (req, res) => {
  try {
    const {
      prescription_id,
      appointment_id,
      doctor_id,
      patient_id,
      problem,
      doctor_notes,
      medicines,
      pdf_link
    } = req.body;

    // Validation: required fields according to schema
    if (
      !appointment_id ||
      !doctor_id ||
      !patient_id ||
      !problem ||
      !doctor_notes ||
      !medicines
    ) {
      return res.status(400).json({
        success: false,
        message: 'appointment_id, doctor_id, patient_id, problem, doctor_notes and medicines are required'
      });
    }

    // Generate prescription_id if not provided
    const id = prescription_id || (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'));

    const prescriptionData = {
      prescription_id: id,
      appointment_id,
      doctor_id,
      patient_id,
      problem,
      doctor_notes,
      medicines,
      ...(pdf_link !== undefined && { pdf_link }),
      created_at: new Date()
    };

    const prescription = await Prescription.create(prescriptionData);

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get prescription by ID
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get prescription by appointment ID
const getPrescriptionByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const prescription = await Prescription.findByAppointmentId(appointmentId);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found for this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get prescription with full details
const getPrescriptionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.getPrescriptionDetails(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get prescriptions by patient ID
const getPrescriptionsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptions = await Prescription.findByPatientId(patientId);

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get prescriptions by doctor ID
const getPrescriptionsByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const prescriptions = await Prescription.findByDoctorId(doctorId);

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all prescriptions
const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll();

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update prescription (partial update)
const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      appointment_id,
      doctor_id,
      patient_id,
      problem,
      doctor_notes,
      medicines,
      pdf_link
    } = req.body;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    const updateData = {};
    if (appointment_id !== undefined) updateData.appointment_id = appointment_id;
    if (doctor_id !== undefined) updateData.doctor_id = doctor_id;
    if (patient_id !== undefined) updateData.patient_id = patient_id;
    if (problem !== undefined) updateData.problem = problem;
    if (doctor_notes !== undefined) updateData.doctor_notes = doctor_notes;
    if (medicines !== undefined) updateData.medicines = medicines;
    if (pdf_link !== undefined) updateData.pdf_link = pdf_link;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update'
      });
    }

    const updatedPrescription = await Prescription.update(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      data: updatedPrescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update PDF link only
const updatePdfLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { pdf_link } = req.body;

    if (!pdf_link) {
      return res.status(400).json({
        success: false,
        message: 'PDF link is required'
      });
    }

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    await Prescription.updatePdfLink(id, pdf_link);

    res.status(200).json({
      success: true,
      message: 'PDF link updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete prescription
const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    await Prescription.delete(id);

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get total prescription count
const getPrescriptionCount = async (req, res) => {
  try {
    const count = await Prescription.count();

    res.status(200).json({
      success: true,
      data: { total: count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createPrescription,
  getPrescriptionById,
  getPrescriptionByAppointmentId,
  getPrescriptionDetails,
  getPrescriptionsByPatientId,
  getPrescriptionsByDoctorId,
  getAllPrescriptions,
  updatePrescription,
  updatePdfLink,
  deletePrescription,
  getPrescriptionCount
};
