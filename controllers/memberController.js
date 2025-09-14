const Member = require('../models/Member');
const { members, transactions } = require('../config/database');

class MemberController {
    static createMember(req, res, next) {
        try {
            const { member_id, name, age } = req.body;

            Member.validate({ member_id, name, age });

            if (members.has(member_id)) {
                return res.status(400).json({ 
                    message: `member with id: ${member_id} already exists` 
                });
            }

            const newMember = new Member(member_id, name, age);
            members.set(member_id, newMember);
            
            res.json(newMember.toJSON());
        } catch (error) {
            next(error);
        }
    }

    static getMember(req, res, next) {
        try {
            const memberId = parseInt(req.params.member_id);
            const member = members.get(memberId);

            if (!member) {
                return res.status(404).json({ 
                    message: `member with id: ${memberId} was not found` 
                });
            }

            res.json(member.toJSON());
        } catch (error) {
            next(error);
        }
    }

    static getAllMembers(req, res, next) {
        try {
            const memberList = Array.from(members.values())
                .map(member => member.toListFormat());

            res.json({ members: memberList });
        } catch (error) {
            next(error);
        }
    }

    static updateMember(req, res, next) {
        try {
            const memberId = parseInt(req.params.member_id);
            const member = members.get(memberId);

            if (!member) {
                return res.status(404).json({ 
                    message: `member with id: ${memberId} was not found` 
                });
            }

            member.update(req.body);
            members.set(memberId, member);
            
            res.json(member.toJSON());
        } catch (error) {
            next(error);
        }
    }

    static deleteMember(req, res, next) {
        try {
            const memberId = parseInt(req.params.member_id);
            const member = members.get(memberId);

            if (!member) {
                return res.status(404).json({ 
                    message: `member with id: ${memberId} was not found` 
                });
            }

            if (member.has_borrowed) {
                return res.status(400).json({ 
                    message: `cannot delete member with id: ${memberId}, member has an active book borrowing` 
                });
            }

            members.delete(memberId);
            res.json({ 
                message: `member with id: ${memberId} has been deleted successfully` 
            });
        } catch (error) {
            next(error);
        }
    }

    static getMemberHistory(req, res, next) {
        try {
            const memberId = parseInt(req.params.member_id);
            const member = members.get(memberId);

            if (!member) {
                return res.status(404).json({ 
                    message: `member with id: ${memberId} was not found` 
                });
            }

            const { books } = require('../config/database');
            const memberTransactions = Array.from(transactions.values())
                .filter(t => t.member_id === memberId)
                .map(t => {
                    const book = books.get(t.book_id);
                    return {
                        transaction_id: t.transaction_id,
                        book_id: t.book_id,
                        book_title: book.title,
                        borrowed_at: t.borrowed_at,
                        returned_at: t.returned_at,
                        status: t.status
                    };
                });

            res.json({
                member_id: memberId,
                member_name: member.name,
                borrowing_history: memberTransactions
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = MemberController;