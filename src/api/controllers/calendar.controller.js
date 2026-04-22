const calendarService = require("../services/calendar.service");

exports.getCalendarClasses = async (req, res) => {
  try {
    const result = await calendarService.getCalendarClasses(req.user, req.query.hoc_ky);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMonthEvents = async (req, res) => {
  try {
    const result = await calendarService.getMonthEvents(req.user, req.query);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDayEvents = async (req, res) => {
  try {
    const result = await calendarService.getDayEvents(req.user, req.query);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
