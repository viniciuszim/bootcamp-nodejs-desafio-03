const Ad = require('../models/Ad')
const User = require('../models/User')
const Purchase = require('../models/Purchase')
const PurchaseMail = require('../jobs/PurchaseMail')
const Queue = require('../services/Queue')

class PurchaseController {
  async index (req, res) {
    const purchases = await Purchase.find()

    return res.json(purchases)
  }

  async store (req, res) {
    const { ad, content } = req.body

    const purchaseAd = await Ad.findById(ad).populate('author')
    const user = await User.findById(req.userId)

    if (purchaseAd.purchasedBy != null) {
      return res.status(400).json({ error: 'Ad already sold' })
    }

    const purchase = await Purchase.create({
      content,
      ad: purchaseAd,
      user
    })

    Queue.create(PurchaseMail.key, {
      ad: purchaseAd,
      user,
      content
    }).save()

    return res.json(purchase)
  }

  async update (req, res) {
    let purchase = await Purchase.findById(req.params.id)

    if (purchase.sold) {
      return res.status(400).json({ error: 'Purchase already sold' })
    }

    purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      { sold: true },
      {
        new: true // esse new: true vai atualizar as informações do ad depois do update
      }
    )

    await Ad.findByIdAndUpdate(
      purchase.ad,
      { purchasedBy: purchase },
      {
        new: true // esse new: true vai atualizar as informações do ad depois do update
      }
    )

    return res.json(purchase)
  }
}

module.exports = new PurchaseController()
