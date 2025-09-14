class Member {
    constructor(member_id, name, age) {
        this.member_id = member_id;
        this.name = name;
        this.age = age;
        this.has_borrowed = false;
    }

    static validate(data) {
        const { member_id, name, age } = data;
        
        if (!member_id || !name || age === undefined) {
            throw new Error("Missing required fields: member_id, name, age");
        }

        if (typeof age !== 'number' || age < 12) {
            throw new Error(`invalid age: ${age}, must be 12 or older`);
        }

        return true;
    }

    update(data) {
        if (data.name !== undefined) this.name = data.name;
        if (data.age !== undefined) {
            if (typeof data.age !== 'number' || data.age < 12) {
                throw new Error(`invalid age: ${data.age}, must be 12 or older`);
            }
            this.age = data.age;
        }
    }

    toJSON() {
        return {
            member_id: this.member_id,
            name: this.name,
            age: this.age,
            has_borrowed: this.has_borrowed
        };
    }

    toListFormat() {
        return {
            member_id: this.member_id,
            name: this.name,
            age: this.age
        };
    }
}

module.exports = Member;