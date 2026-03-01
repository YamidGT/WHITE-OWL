const axios = require("axios");

const ROUTING_SERVICE_URL = process.env.ROUTING_SERVICE_URL || "http://localhost:8000";

const calculateRoute = async (req, res, next) => {
  try {
    const { origin_lng, origin_lat, destination_lng, destination_lat, algorithm } = req.body;

    const response = await axios.post(`${ROUTING_SERVICE_URL}/calculate-route`, {
      origin_lng,
      origin_lat,
      destination_lng,
      destination_lat,
      algorithm: algorithm || "dijkstra",
    });

    res.json(response.data);
  } catch (error) {
    next(error);
  }
};

const getRouteHistory = async (req, res, next) => {
  try {
    // TODO: Obtener historial de rutas del usuario desde la base de datos
    res.json([]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateRoute,
  getRouteHistory,
};
