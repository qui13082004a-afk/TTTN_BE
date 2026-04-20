const groupChangeRequestService = require("../services/groupChangeRequest.service");

exports.createRequest = async (req, res) => {
  try {
    const result = await groupChangeRequestService.createRequest(req.user, req.body);
    res.status(201).json({
      message: "Gui yeu cau chuyen nhom thanh cong",
      request: result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const result = await groupChangeRequestService.rejectRequest(Number(requestId), req.user);
    res.json({
      message: "Tu choi yeu cau chuyen nhom thanh cong",
      result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const result = await groupChangeRequestService.approveRequest(Number(requestId), req.user);
    res.json({
      message: "Duyet yeu cau chuyen nhom thanh cong",
      result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
