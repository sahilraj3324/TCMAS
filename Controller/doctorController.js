const DoctorDetails = require('../Model/DoctorDetails');

// Create doctor details
const createDoctorDetails = async (req, res) => {
  try {
    const {
      doctor_id,
      name,
      specialization,
      qualification,
      experience_years,
      city,
      phone_number,
      is_active,
      clinic_name,
      clinic_address
    } = req.body;

    // Validation: required fields
    if (
      !doctor_id ||
      !name ||
      !specialization ||
      !qualification ||
      experience_years === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Coerce is_active if provided (accept 'true'/'false' or 1/0)
    const activeFlag = is_active === undefined
      ? undefined
      : (is_active === true || is_active === 'true' || is_active === 1 || is_active === '1');

    const doctorData = {
      doctor_id,
      name,
      specialization,
      qualification,
      experience_years,
      // include optional fields only if provided
      ...(city !== undefined && { city }),
      ...(phone_number !== undefined && { phone_number }),
      ...(activeFlag !== undefined && { is_active: activeFlag }),
      ...(clinic_name !== undefined && { clinic_name }),
      ...(clinic_address !== undefined && { clinic_address })
    };

    const doctor = await DoctorDetails.create(doctorData);

    res.status(201).json({
      success: true,
      message: 'Doctor details created successfully',
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get doctor details by doctor ID
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await DoctorDetails.findByDoctorId(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor details not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get doctor with user info
const getDoctorWithUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await DoctorDetails.getDoctorWithUserInfo(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await DoctorDetails.findAll();

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get doctors by specialization
const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    const doctors = await DoctorDetails.findBySpecialization(specialization);

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all specializations
const getAllSpecializations = async (req, res) => {
  try {
    const specializations = await DoctorDetails.getAllSpecializations();

    res.status(200).json({
      success: true,
      count: specializations.length,
      data: specializations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update doctor details
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      specialization,
      qualification,
      experience_years,
      city,
      phone_number,
      is_active,
      clinic_name,
      clinic_address
    } = req.body;

    const doctor = await DoctorDetails.findByDoctorId(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor details not found'
      });
    }

    // Build update payload only with provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (qualification !== undefined) updateData.qualification = qualification;
    if (experience_years !== undefined) updateData.experience_years = experience_years;
    if (city !== undefined) updateData.city = city;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (clinic_name !== undefined) updateData.clinic_name = clinic_name;
    if (clinic_address !== undefined) updateData.clinic_address = clinic_address;

    if (is_active !== undefined) {
      updateData.is_active = (is_active === true || is_active === 'true' || is_active === 1 || is_active === '1');
    }

    const updatedDoctor = await DoctorDetails.update(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Doctor details updated successfully',
      data: updatedDoctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete doctor details
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await DoctorDetails.findByDoctorId(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor details not found'
      });
    }

    await DoctorDetails.delete(id);

    res.status(200).json({
      success: true,
      message: 'Doctor details deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search doctors
const searchDoctors = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const doctors = await DoctorDetails.search(query);

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createDoctorDetails,
  getDoctorById,
  getDoctorWithUserInfo,
  getAllDoctors,
  getDoctorsBySpecialization,
  getAllSpecializations,
  updateDoctor,
  deleteDoctor,
  searchDoctors
};
