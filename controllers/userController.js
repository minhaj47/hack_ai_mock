// In-memory storage
const members = new Map();

exports.addMember = async (req, res)=> {

  const { member_id, name, age } = req.body;

  // Validation
  if (!member_id || !name || age === undefined) {
    return res.status(400).json({
      message: "member_id, name, and age are required"
    });
  }

  if (age < 0 || age > 150) {
    return res.status(400).json({
      message: "age must be between 0 and 150"
    });
  }

  // Check for duplicate ID
  if (members.has(member_id)) {
    return res.status(409).json({
      message: `member with id: ${member_id} already exists`
    });
  }

  // Create new member
  const newMember = {
    member_id,
    name,
    age,
    has_borrowed: false
  };

  members.set(member_id, newMember);

  res.status(200).json(newMember);
}