const express = require('express');
const MemberController = require('../controllers/memberController');

const router = express.Router();

router.post('/members', MemberController.createMember);
router.get('/members/:member_id', MemberController.getMember);
router.get('/members', MemberController.getAllMembers);
router.put('/members/:member_id', MemberController.updateMember);
router.delete('/members/:member_id', MemberController.deleteMember);
router.get('/members/:member_id/history', MemberController.getMemberHistory);

module.exports = router;