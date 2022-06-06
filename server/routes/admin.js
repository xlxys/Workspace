const User           = require('../models').User

//admin panel configuration
const express = require('express')
const app = express()

const AdminJS           = require('adminjs')
const AdminJSExpress    = require('@adminjs/express')
const AdminJSSequelize  = require('@adminjs/sequelize')


AdminJS.registerAdapter(AdminJSSequelize)


const adminJs = new AdminJS({
  rootPath: '/admin',
  resources: [
    {
      resource: User, 
      options:
        { listProperties: ['firstName', 'lastName', 'email', 'status'] }, 

        properties: 
      { 
      firstName: {isVisible: { list: true, filter: true, show: true, edit: true },},
      lastName: {isVisible: { list: true, filter: true, show: true, edit: true },},
      email: {isVisible: { list: true, filter: true, show: true, edit: true },},
      status: {isVisible: { list: true, filter: true, show: true, edit: true },},
      }
    },
    // {resource: Meet, options:},
  ],
  branding: {
  logo: 'https://th.bing.com/th/id/OIP.dCJk51QZStzKwKelbyaz2AHaHa?pid=ImgDet&rs=1',
  companyName: 'La BADR',
  softwareBrothers: false   // if Software Brothers logos should be shown in the sidebar footer
},
})

const adminRouter  = AdminJSExpress.buildRouter(adminJs)

module.exports = adminRouter 