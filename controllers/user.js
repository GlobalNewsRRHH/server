const { generateToken } = require('../utils/token')
const { verifyToken } = require('../utils/token')
const { generateString } = require('../utils/randomString')
const { ValidationError } = require('sequelize')
const {
  User,
  Position,
  Team,
  Category,
  Office,
  Review,
  Sequelize,
} = require('../models')

const allUser = async (req, res, next) => {
  let user

  const token = req.cookies.token
  const { id, isAdmin } = verifyToken(token)

  try {
    if (isAdmin) {
      user = await User.findAll({
        where: {
          deactivated_at: null,
          id: {
            [Sequelize.Op.not]: id,
          },
        },
        include: [
          { model: Position, as: 'position' },
          { model: Team, as: 'team' },
          { model: Category, as: 'category' },
          { model: Office, as: 'office' },
          { model: User, as: 'leader' },
        ],
        order: [['id', 'ASC']],
      })
    } else {
      user = await User.findAll({
        where: {
          deactivated_at: null,
          isAdmin: {
            [Sequelize.Op.not]: true,
          },
        },
        include: [
          { model: Position, as: 'position' },
          { model: Team, as: 'team' },
          { model: Category, as: 'category' },
          { model: Office, as: 'office' },
          { model: User, as: 'leader' },
        ],
        order: [['id', 'ASC']],
      })
    }
  } catch (error) {
    next(error)
  }
  return res.send(user)
}

const allEmpleados = async (req, res, next) => {
  try {
    user = await User.findAll({
      where: {
        leaderId: req.params.id,
      },
    const user = await User.findAll({
      where: { leaderId: req.params.id },
      include: [
        { model: Position, as: 'position' },
        { model: Team, as: 'team' },
        { model: Category, as: 'category' },
        { model: Office, as: 'office' },
        { model: User, as: 'leader' },
      ],
      order: [['id', 'ASC']],
    })
    res.send(user)
  } catch (error) {
    next(error)
  }
}

const getAllUsersDesactivated = async (req, res, next) => {
  const token = req.cookies.token
  const { id } = verifyToken(token)

  const getUserDesactivated = await User.findAll({
    attributes: [
      'id',
      'firstName',
      'lastName',
      'email',
      'image',
      'fileNumber',
      'isAdmin',
      'deactivated_at',
      'shift',
    ],
    where: {
      deactivated_at: {
        [Sequelize.Op.ne]: null,
      },
      id: {
        [Sequelize.Op.not]: id,
      },
    },
      include: [
        { model: Position, as: 'position', attributes: ['id', 'name'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'competence', 'function'],
        },
        { model: Office, as: 'office', attributes: ['id', 'name'] },
        {
          model: User,
          as: 'leader',
          attributes: [
            'id',
            'firstName',
            'lastName',
            'email',
            'image',
            'fileNumber',
            'isAdmin',
            'deactivated_at',
            'shift',
          ],
        },
      ],
      order: [['id', 'ASC']],
    })
    res.status(200).send(getUserDesactivated)
  } catch (error) {
    next(error)
  }
}

const includeDeactivated = async (req, res, next) => {
  let user

  const token = req.cookies.token
  const { id, isAdmin } = verifyToken(token)

  try {
    if (isAdmin) {
      user = await User.findAll({
        where: {
          id: {
            [Sequelize.Op.not]: id,
          },
        },
        include: [
          { model: Position, as: 'position' },
          { model: Team, as: 'team' },
          { model: Category, as: 'category' },
          { model: Office, as: 'office' },
          { model: User, as: 'leader' },
        ],
        order: [['id', 'ASC']],
      })
    } else {
      user = await User.findAll({
        where: {
          isAdmin: {
            [Sequelize.Op.not]: true,
          },
        },
        include: [
          { model: Position, as: 'position' },
          { model: Team, as: 'team' },
          { model: Category, as: 'category' },
          { model: Office, as: 'office' },
          { model: User, as: 'leader' },
        ],
        order: [['id', 'ASC']],
      })
    }
  } catch (error) {
    next(error)
  }
  return res.send(user)
}

const oneUser = async (req, res, next) => {
  const { id } = req.params
  try {
    const user = await User.findByPk(id, {
      include: [
        { model: Position, as: 'position' },
        { model: Team, as: 'team' },
        { model: Category, as: 'category' },
        { model: Office, as: 'office' },
        { model: User, as: 'leader' },
        { model: Review, as: 'evaluated' },
      ],
    })
    res.send(user)
  } catch (error) {
    next(error)
  }
}

const createUser = async (req, res, next) => {
  const { leader, position, team, category, office, ...userFields } = req.body

  try {
    const positionToSet = await Position.findByPk(position)
    const teamToSet = await Team.findByPk(team)
    const categoryToSet = await Category.findByPk(team)
    const officeToSet = await Office.findByPk(office)
    const leaderToSet = await User.findOne({ where: { fileNumber: leader } })

    // TODO cambiar por findOrBuild y luego save
    const [user, created] = await User.findOrCreate({
      where: { email: userFields.email },
      defaults: {
        ...userFields,
        password: userFields.fileNumber,
      },
      include: [
        { model: Position, as: 'position' },
        { model: Team, as: 'team' },
        { model: Category, as: 'category' },
        { model: Office, as: 'office' },
        { model: User, as: 'leader' },
      ],
    })
    if (created) {
      await user.setPosition(positionToSet)
      await user.setTeam(teamToSet)
      await user.setCategory(categoryToSet)
      await user.setOffice(officeToSet)
      await user.setLeader(leaderToSet)
    }

    res.status(201).send(user)
  } catch (error) {
    if (error instanceof ValidationError) error.status = 422
    next(error)
  }
}

const modifyUser = async (req, res, next) => {
  const { leader, position, team, category, office, ...userFields } = req.body

  let positionToSet, teamToSet, categoryToSet, officeToSet, leaderToSet

  if (position) positionToSet = await Position.findByPk(position)
  if (team) teamToSet = await Team.findByPk(team)
  if (category) categoryToSet = await Category.findByPk(team)
  if (office) officeToSet = await Office.findByPk(office)
  if (leader)
    leaderToSet = await User.findOne({ where: { fileNumber: leader } })

  try {
    const user = await User.findByPk(req.params.id)
    user.update({ ...userFields }, { returning: true })
    if (positionToSet) await user.setPosition(positionToSet)
    if (teamToSet) {
      await user.setTeam(teamToSet)
    } else {
      user.setTeam(null)
    }
    if (categoryToSet) await user.setCategory(categoryToSet)
    if (officeToSet) await user.setOffice(officeToSet)
    if (leaderToSet) await user.setLeader(leaderToSet)

    res.send(user)
  } catch (error) {
    next(error)
  }
}

const userMeEdit = async (req, res, next) => {
  let user, affected, resulting, payload, token
  const { password, previousPass } = req.body
  const userFind = await User.findByPk(req.user.id)
  const isPasswordValid = await userFind.hasPassword(previousPass)
  if (!isPasswordValid) {
    const error = new Error('La contraseña anterior no coincide')
    error.status = 401
    return res.status(error.status).send(error.message)
  } else {
    try {
      user = await User.findOne({ where: { email: req.user.email } })
      ;[affected, resulting] = await User.update(
        { password },
        { where: { email: user.email }, returning: true, individualHooks: true }
      )
      const { id, name, lastName, email, isAdmin } = resulting[0]
      payload = { id, name, lastName, email, isAdmin }
      token = await generateToken(payload)
    } catch (error) {
      return res.send(error).status(400)
    }
    return res.cookie('token', token).send(payload)
  }
}

const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: User, as: 'led' }],
    })

    if (user.led[0]) {
      return res
        .status(403)
        .send('No puede desactivar un usuario que tiene empleados a cargo')
    }

    user.categoryId = null
    user.positionId = null
    user.teamId = null
    user.leaderId = null
    user.officeId = null
    user.deactivated_at = new Date()
    user.password = generateString(8)

    res.sendStatus(204)
  } catch (error) {
    return res.send(console.error(error)).status(400)
  }
}

const getUserCountPositions = async (req, res) => {
  const getUsers = await User.findAll({
    attributes: ['positionId', [Sequelize.fn('COUNT', 'positionId'), 'count']],
    include: [{ model: Position, as: 'position', attributes: ['name'] }],
    group: ['positionId', 'position.id'],
  })

  res.send(getUsers)
}

module.exports = {
  allUser,
  oneUser,
  modifyUser,
  createUser,
  includeDeactivated,
  deactivateUser,
  allEmpleados,
  getAllUsersDesactivated,
  userMeEdit,
  getUserCountPositions,
}
