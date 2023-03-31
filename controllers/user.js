const { ValidationError } = require('sequelize')
const { Position } = require('../models')

const { User } = require('../models')

const allUser = async (req, res, next) => {
  let user

  try {
    user = await User.findAll({
      where: { deactivated_at: null },
      include: [
        {
          model: Position,
          attributes: ['name'],
        },
      ],
    })
  } catch (error) {
    return res.send(console.error(error)).status(400)
  }

  return res.send(user)
}

const includeDeactivated = async (req, res, next) => {
  let user

  try {
    user = await User.findAll({
      include: [{ model: Position, attributes: ['name'] }],
    })
  } catch (error) {
    return res.send(console.error(error)).status(400)
  }

  return res.send(user)
}

const oneUser = async (req, res, next) => {
  const { id } = req.params
  let user

  try {
    user = await User.findByPk(id, {
      include: [{ model: Position, attributes: ['name'] }],
    })
  } catch (error) {
    return res.send(console.error(error)).status(400)
  }

  return res.send(user)
}

const createUser = async (req, res, next) => {
  try {
    const { position, team, ...userFields } = req.body

    const positionToSet = await Position.findOne({
      where: { name: position },
    })

    const addedUser = await User.create({ ...userFields })
    addedUser.setPosition(positionToSet)
    // TODO
    // addedUser.setLeader()
    // addedUser.SetLed()

    res.status(201).send(addedUser)
  } catch (error) {
    if (error instanceof ValidationError) error.status = 422
    console.error(error)
    next(error)
  }
}

const modifyUser = async (req, res, next) => {
  const { firstName, lastName, email, fileNumber, position, shift } = req.body
  let user

  try {
    user = await User.findByPk(req.params.id)
    user.firstName ||= firstName
    user.lastName ||= lastName
    user.email ||= email
    user.fileNumber ||= fileNumber
    user.shift ||= shift
    user.setPosition(position)
    /* user = await User.update(
      { firstName, lastName, email, fileNumber, shift, position },
      { where: { id: req.params.id }, returning: true }
    ) */
    user.save()
    console.log(user)
  } catch (error) {
    return res.send(console.error(error)).status(400)
  }

  return res.send(user)
}

const deactivateUser = async (req, res, next) => {
  let user
  const timestamp = Date.now()

  try {
    user = await User.update(
      { deactivated_at: new Date() },
      { where: { id: req.params.id }, returning: true, individualHooks: true }
    )
  } catch (error) {
    return res.send(console.error(error)).status(400)
  }

  return res.sendStatus(204)
}

module.exports = {
  allUser,
  oneUser,
  modifyUser,
  createUser,
  includeDeactivated,
  deactivateUser,
}
