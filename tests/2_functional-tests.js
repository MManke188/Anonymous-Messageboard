const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let id
  let id2
  let password = 'passwordTest'
  let replyId
  let replyId2

  // #1
  test("Creating a new thread" ,  (done) => {
    chai.request(server)
      .post('/api/threads/TestBoard')
      .send({text: 'This is a test', delete_password: password})
      .end((err, res) => {
        assert.equal(res.status, 200)
        done();
      })
  });
  // #2
  test("Viewing the 10 most recent threads with 3 replies each" ,  (done) => {
    chai.request(server)
      .get('/api/threads/TestBoard')
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.isAtMost(res.body.length, 10)
        for(let i = 0; i< res.body.length; i++) {
          assert.isAtMost(res.body[i].replies.length, 3)
        }
        id = res.body[0]._id
        id2 = res.body[1]._id
        done();
      })
  });
  // #3
  test("Deleting a thread with the incorrect password" ,  (done) => {
    chai.request(server)
      .delete('/api/threads/TestBoard')
      .send({thread_id: id, delete_password: 'not a correct password'})
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.text, 'incorrect password')

        done();
      })
  });
  // #4
  test("Deleting a thread with the correct password" ,  (done) => {
    chai.request(server)
      .delete('/api/threads/TestBoard')
      .send({thread_id: id, delete_password: password})
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.text, 'success')
        done();
      })
  });
  // #5
  test("Reporting a thread" ,  (done) => {
    chai.request(server)
      .put('/api/threads/TestBoard')
      .send({thread_id: id2})
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.text, 'success')
        done();
      })
  });
  // #6
  test("Creating a new reply" ,  (done) => {
    chai.request(server)
      .post('/api/replies/TestBoard')
      .send({thread_id: id2, text: 'This is a test reply', delete_password: password})
      .end((err, res) => {
        assert.equal(res.status, 200)
        done();
      })
  });
  // #7
  test("Viewing a single thread with all replies" ,  (done) => {
    chai.request(server)
      .get('/api/replies/TestBoard?thread_id=' + id2)
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.property(res.body, 'replies')
        replyId = res.body.replies[0]._id
        replyId2 = res.body.replies[1]._id
        done();
      })
  });
  // #8
  test("Deleting a reply with the incorrect password" ,  (done) => {
    chai.request(server)
      .delete('/api/replies/TestBoard')
      .send({thread_id: id2, reply_id: replyId, delete_password: 'not the correct password'})
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.text, 'incorrect password')
        done();
      })
  });
  // #9
  test("Deleting a reply with the correct password" ,  (done) => {
    chai.request(server)
      .delete('/api/replies/TestBoard')
      .send({thread_id: id2, reply_id: replyId, delete_password: password})
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.text, 'success')
        done();
      })
  });
  // #10
  test("Reporting a reply" ,  (done) => {
    chai.request(server)
      .put('/api/replies/TestBoard')
      .send({thread_id: id2, reply_id: replyId2, })
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.text, 'success')
        done();
      })
  });
  
});
