const Mail = require('../services/Mail')

class PurchaseMail {
  get key () {
    return 'PurchaseMail'
  }

  async handle (job, done) {
    const { ad, user, content } = job.data

    await Mail.sendMail({
      from: '"Vinicius Miguel" <vinicius@simber.com.br>',
      to: ad.author.email,
      subject: `Solicição de compra: ${ad.title}`,
      // html: `<p>Olá ${user.name}: ${content}</p>`
      template: 'purchase',
      context: { user, content, ad }
    })

    return done()
  }
}

module.exports = new PurchaseMail()
