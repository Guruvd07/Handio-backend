import Provider from "../models/ProviderProfile.js";

export const verifyProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ msg: "Provider not found" });
    }

    // verify provider
    provider.verified = true;

    await provider.save();

    res.json({ msg: "Provider verified" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};