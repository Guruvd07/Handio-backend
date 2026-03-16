import ProviderProfile from "../models/ProviderProfile.js";

/* =========================
   CREATE PROVIDER PROFILE
========================= */

export const createProfile = async (req, res) => {
  try {

    const profile = await ProviderProfile.create({
      userId: req.user.id,
      category: req.body.category,
      city: req.body.city,
      area: req.body.area,
      description: req.body.description,
      priceAmount: req.body.priceAmount,
      priceType: req.body.priceType
    });

    res.json(profile);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* =========================
   UPLOAD PROFILE PHOTO
========================= */

export const uploadProfilePhoto = async (req, res) => {
  try {

    const provider = await ProviderProfile.findOne({
      userId: req.user.id
    });

    if (!provider) {
      return res.status(404).json({
        message: "Provider profile not found"
      });
    }

    const imageUrl = req.file.path;

    provider.profilePhoto = imageUrl;

    await provider.save();

    res.json({
      profilePhoto: provider.profilePhoto
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

/* =========================
   UPLOAD PORTFOLIO IMAGE
========================= */

export const uploadPortfolioImage = async (req, res) => {

  try {

    const provider = await ProviderProfile.findOne({
      userId: req.user.id
    });

    if (!provider) {
      return res.status(404).json({
        message: "Provider profile not found"
      });
    }

    const imageUrl = req.file.path;

    // duplicate check
    const alreadyExists = provider.portfolio.find(
      item => item.imageUrl === imageUrl
    );

    if (!alreadyExists) {

      provider.portfolio.push({
        imageUrl: imageUrl,
        caption: req.body.caption || ""
      });

    }

    await provider.save();

    res.json({
      message: "Portfolio image uploaded",
      portfolio: provider.portfolio
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

/* =========================
   SEARCH PROVIDERS
========================= */

export const searchProviders = async (req, res) => {
  try {

    const { category, city, area } = req.query;

    const filter = { verified: true };

    if (category) filter.category = category;
    if (city) filter.city = city;
    if (area) filter.area = area;

    const providers = await ProviderProfile
      .find(filter)
      .populate("userId", "name email");

    res.json(providers);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* =========================
   GET PROVIDER BY ID
========================= */

export const getProviderById = async (req, res) => {
  try {

    const provider = await ProviderProfile
      .findById(req.params.id)
      .populate("userId", "name email");

    if (!provider) {
      return res.status(404).json({
        message: "Provider not found"
      });
    }

    res.json(provider);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {

    const provider = await ProviderProfile
      .findOne({ userId: req.user.id })
      .populate("userId", "name email");

    if (!provider) {
      return res.status(404).json({
        message: "Provider profile not found"
      });
    }

    res.json(provider);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


export const deleteProfilePhoto = async (req, res) => {
  try {

    const provider = await ProviderProfile.findOne({
      userId: req.user.id
    });

    if (!provider) {
      return res.status(404).json({
        message: "Provider profile not found"
      });
    }

    provider.profilePhoto = "";

    await provider.save();

    res.json({
      message: "Profile photo removed successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};