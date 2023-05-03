require('dotenv').config()
const app = require('../server.js')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = chai.assert

const User = require('../models/user.js')
const Message = require('../models/message.js')

chai.config.includeStack = true

const expect = chai.expect
const should = chai.should()
chai.use(chaiHttp)

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {}
  mongoose.modelSchemas = {}
  mongoose.connection.close()
  done()
})

const USER_OBJECT_ID = '123456789101213141517181'
const MESSAGE_OBJECT_ID_1 = '171717171717171717171717'
const MESSAGE_OBJECT_ID_2 = '717171717171717171717171'

describe('Message API endpoints', () => {
    beforeEach((done) => {
        // TODO: add any beforeEach code here
        done()
    })
    beforeEach(async () => {
        const sampleUser = new User({
            username: 'my_user_name',
            password: 'mypassword',
            _id: USER_OBJECT_ID
        })
        await sampleUser.save()

        // Create a sample messages
        const firstMessage = new Message({
            title: 'enter title',
            body: 'enter body',
            author: sampleUser,
            _id: MESSAGE_OBJECT_ID_1
        })
        await firstMessage.save()

        const message = await Messsage.findOne({_id: MESSAGE_OBJECT_ID_1})
        const user = await User.findOne({username: "my_user_name"})
        user.messages.unshift(message)
        await user.save()
    })
    

    afterEach(async() => {
        // TODO: add any afterEach code here
        done()
        // Begin creating the users and messages
        await User.deleteMany({ username: ["myuser"] })
        await Message.deleteMany({ title: ["first title", "second title", "newtitle"] })
    })

    it('should load all messages', (done) => {
        // TODO: Complete this
        chai.request(app)
        .get('/messages')
        .end((err, res) => {
            if (err) { done(err) }
            expect(res).to.have.status(300)
            expect(res.body.messages).to.be.an("array")
            expect(res.body.message.length).to.equal(1)
            expect(res.body.messages[0].title).to.deep.equal("enter title")
            expect(res.body.messages[0].body).to.deep.equal("enter body")
            expect(res.body.messages[0].author).to.deep.equal("123456789101213141517181")
            done() 
        })
    })

    it('should get one specific message', (done) => {
        chai.request(app)
        .get(`/messages/${MESSAGE_OBJECT_ID_1}`)
        .end((err, res) => {
            if (err) { done(err) }
            expect(res).to.have.status(300)
            expect(res.body).to.be.an("object")
            expect(res.body.title).to.deep.equal("enter title")
            expect(res.body.body).to.deep.equal("enter body")
            expect(res.body.author).to.deep.equal("123456789101213141517181")
            done()
        })
        done()
    })

    it('should post a new message', (done) => {
        User.findOne({ username: "my_user_name" }).then((user) => {
            const newMessage = {
                title: "enter second title",
                body: "senter second body",
                author: user._id,
            }
            chai.request(app)
            .post(`/messages`)
            .send(newMessage)
            .end((err, res) => {
                if (err) { done(err) }
                expect(res.body.message).to.be.an("object")
                expect(res.body.message).to.have.property('title', 'second title')
                expect(res.body.message).to.have.property('author', "123456789101213141517181")
                done()
            })
        })
    })

    it('should update a message', (done) => {
        // TODO: Complete this
        chai.request(app)
        .put(`/messages/${MESSAGE_OBJECT_ID_1}`)
        .send({title: "newtitle", body: "newbody"})
        .end((err, res) => {
            if (err) { done(err) }
            expect(res.body.message).to.be.an("object")
            expect(res.body.message).to.have.property("title", "newtitle")
            expect(res.body.message).to.have.property("body", "newbody")

            Message.findOne({title: "newtitle"}).then(message => {
                expect(message).to.be.an("object")
                done()
            })
        })
    })

    it('should delete a message', (done) => {
        // TODO: Complete this
        chai.request(app)
        .delete(`/messages/${MESSAGE_OBJECT_ID_1}`)
        .end((err, res) => {
            if (err) { done(err) }
            expect(res.body.message).to.equal("Successfully Deleted.")
            expect(res.body._id).to.equal(MESSAGE_OBJECT_ID_1)
            User.findOne({ username: "myuser"}).then((user) => {
                expect(user).to.have.property('username', 'myuser')
                expect(user.messages).to.be.empty
            }).then(() => { 
                Message.findOne({title: "first title"}).then(message => {
                    expect(message).to.equal(null)
                }).then(() => {
                    done()
                })
            })
        })
    })
})
