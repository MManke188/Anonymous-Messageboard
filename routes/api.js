'use strict';


var mongoose = require('mongoose')
const { Schema } = mongoose

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

const threadSchema = new Schema({
  board: String,
  text: String,
  delete_password: String,
  created_on: Date,
  bumped_on: Date,
  reported: {type: Boolean, default: false},
  replies: [{
    text: String,
    created_on: Date,
    delete_password: String,
    reported: {type: Boolean, default: false}
  }],
  replycount: {type: Number, default: 0}
})

const Thread = mongoose.model('Thread', threadSchema)


module.exports = function (app) {
  
  app.route('/api/threads/:board')

  .get(function(req, res) {
    let board = req.params.board
    if(board!== undefined) {
      Thread.find({board: board})
      .sort({bumped_on: -1})
      .limit(10)
      .select({reported: 0, delete_password: 0})
      .exec((err, board) => {
        if(!err && board !== null) {
          for(let i = 0; i < board.length; i++) {
            while(board[i].replies.length > 3) {
              board[i].replies.pop()
            }
          }
          res.send(board)
        }
      })
    }
  })

  .post(function(req, res) {
    let board = req.params.board
    let text = req.body.text
    let pW = req.body.delete_password

    if(board !== undefined && text !== undefined && pW !== undefined) {
      let thread = Thread({
        board: board,
        text: text,
        delete_password: pW,
        created_on: Date(),
        bumped_on: Date()
      })

      thread.save((err, sol) => {
        if(!err) {
          res.redirect('/b/' + board + '/')
        }
      })
    }
  })

  .put(function(req,res) {
    let thread_id = req.body.thread_id

    if(thread_id !== undefined) {
      Thread.findById(thread_id, (err, data) => {
        if(!err && data !== null) {
          data.reported = true

          data.save((err, something) => {
            if(!err) {
              res.send('success')
            } 
          })
        }
      })
    }
  })

  .delete(function(req,res) {
    let board = req.params.board
    let thread_id = req.body.thread_id
    let pW = req.body.delete_password
    
    if(board !== undefined && thread_id !== undefined && pW !== null) {
      Thread.findById(thread_id, (err, data) => {
        if(!err && data !== null) {
          if(data.delete_password == pW) {
            Thread.remove({_id: thread_id}, (err, something) => {
              if(!err) {
                res.send('success')
              }
            })
          } else {
            res.send('incorrect password')
          }
        }
      })
    }
  })


  app.route('/api/replies/:board')

  .get(function(req,res) {
    let thread_id = req.query.thread_id

    if(thread_id !== undefined) {
      Thread.findById(thread_id, (err, data) => {
        if(!err && data !== null) {
          let responseObject = {
            _id: data._id,
            board: data.board,
            text: data.text,
            replies: data.replies,
            created_on: data.created_on,
            bumped_on: data.bumped_on
          }
          res.send(responseObject)
        }
      })
    }
  })

  .post(function(req, res) {
    let board = req.params.board
    let thread_id = req.body.thread_id
    let text = req.body.text
    let pW = req.body.delete_password

    if(board !== undefined && thread_id !== undefined && text !== undefined && pW !== undefined) {
      
      Thread.findById(thread_id, (err, data) => {
        if(!err && data !== null) {
          data.bumped_on = Date()
          data.replycount++;
          
          data.replies.push({
            text: text,
            delete_password: pW,
            created_on: Date()
          })

          data.save((err, nothing) => {
            if(!err) {
              res.redirect('/b/' + board + '/' + thread_id)
            }
          })
        }
      })
    } 
  })

  .put(function(req,res) {
    let board = req.params.board
    let thread_id = req.body.thread_id
    let reply_id = req.body.reply_id

    Thread.findById(thread_id, (err, thread) => {
      if(!err && thread !== null) {
        for(let i = 0; i < thread.replies.length; i++) {
          if(thread.replies[i]._id == reply_id) {
            thread.replies[i].reported = true
            thread.save((err, noErr) => {
              if(!err) {
                res.send('success')
              }
            })
          }
        }
      }
    })

  })

  .delete(function(req,res) {
    let thread_id = req.body.thread_id
    let reply_id = req.body.reply_id
    let pW = req.body.delete_password

    Thread.findById(thread_id, (err, thread) => {
      if(!err && thread !== null) {
        for(let i = 0; i < thread.replies.length; i++) {
          if(thread.replies[i]._id == reply_id) {
            if(thread.replies[i].delete_password == pW) {
              thread.replies[i].text = '[deleted]'
              thread.save((err, sol) => {
                if(!err) {
                  res.send('success')
                } else {
                  console.log(err)
                }
              })
            } else {
              res.send('incorrect password')
            }
          }
        }
      }
    })
  })

};