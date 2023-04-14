const { ValidationError } = require('sequelize')
const { Category } = require('../models')

const allCategory = async (req, res, next) => {
  try {
    const category = await Category.findAll({ order: [['id', 'ASC']] })
    res.send(category)
  } catch (error) {
    next(error)
  }
}

const oneCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id)
    res.send(category)
  } catch (error) {
    next(error)
  }
}

const createCategory = async (req, res, next) => {
  try {
    const { ...categoryFields } = req.body
    const category = await Category.create({ ...categoryFields })
    res.status(201).send(category)
  } catch (error) {
    if (error instanceof ValidationError) error.status = 422
    next(error)
  }
}

const modifyCategory = async (req, res, next) => {
  const { ...categoryFields } = req.body

  try {
    const category = await Category.update(
      { ...categoryFields },
      { where: { id: req.params.id }, returning: true }
    )
    res.send(category)
  } catch (error) {
    next(error)
  }
}

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.destroy({ where: { id: req.params.id } })
    res.sendStatus(204)
  } catch (error) {
    res
      .status(error.status)
      .send('No se puede eliminar una Categoría que tenga Usuarios asociados')
    next(error)
  }
}

module.exports = {
  allCategory,
  oneCategory,
  createCategory,
  modifyCategory,
  deleteCategory,
}
