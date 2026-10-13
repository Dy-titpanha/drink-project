import sequelize from '../backend/src/config/db.js';
import { Order } from '../backend/src/models/index.js';

const checkOrder = async () => {
  try {
    await sequelize.authenticate();
    const latestOrder = await Order.findOne({ order: [['id', 'DESC']] });
    if (latestOrder) {
      console.log('Order columns in JS object:');
      console.log('createdAt attribute:', latestOrder.createdAt);
      console.log('created_at attribute:', latestOrder.created_at);
      console.log('Raw dataValues keys:', Object.keys(latestOrder.dataValues));
      console.log('Raw dataValues values:', latestOrder.dataValues);
    } else {
      console.log('No orders found to inspect.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkOrder();
