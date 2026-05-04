const groupChangeRequestService = require("../services/groupChangeRequest.service");

exports.createRequest = async (req, res) => {
  try {

    const targetCount = await ThanhVienNhom.count({
      where: { id_nhom: targetGroupId }
    });

    if (targetCount >= Number(targetGroup.so_luong_toi_da || 0)) {
      throw new Error("Nhom da day");
    }

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

exports.cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await groupChangeRequestService.cancelRequest(
      Number(requestId),
      req.user
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMyRequest = async (req, res) => {
  try {
    const result = await groupChangeRequestService.getMyRequest(req.user);

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};