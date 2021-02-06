const express = require(`express`)
const createError = require(`http-errors`)
const jwt = require(`jsonwebtoken`)
const bcrypt = require(`bcrypt`)
const { body, validationResult } = require('express-validator')

const router = express.Router()

const saltRounds = 10

// User Model 
const User = require(`../../models/usermodel/user`)

router.get(`/register`, (req, res, next) => {
    res.render(`register`)
})

router.post(`/register`, body('password').isLength({ min: 5 }).withMessage(`Password must minimum of 5 characters.`), async (req, res, next) => {

    const {firstName, lastName, email, password, passwordConfirm} = req.body

    try {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        if (password !== passwordConfirm) {
            return next(createError(400, `Password must match.`))
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds)

        const newStudent = await new User ({
            firstName,
            lastName,
            email,
            password: hashedPassword
        })

        const savedStudent = await newStudent.save()
        const token = await jwt.sign({activeUser: newStudent._id}, process.env.JWT_KEY)
        req.session.token = token
        console.log(req.session.token)

        res.json({
            savedStudent
        })
        
    } catch (err) {
        next(createError(400, err))
    }



})

module.exports = router