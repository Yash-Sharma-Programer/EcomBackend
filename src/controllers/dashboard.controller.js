import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";
import orderModel from "../models/order.model.js";
import categoryModel from "../models/category.model.js";

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function getDashboardStats(req, res) {
    try {
        const [totalUsers, totalProducts, totalOrders, totalCategories] = await Promise.all([
            userModel.countDocuments({ role: 'user' }),
            productModel.countDocuments(),
            orderModel.countDocuments(),
            categoryModel.countDocuments()
        ]);

        const revenueAgg = await orderModel.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;

        const recentOrders = await orderModel.find().sort({ createdAt: -1 }).limit(8);
        const recentUsers = await userModel.find({ role: 'user' }).select('-password').sort({ createdAt: -1 }).limit(8);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const ordersByMonth = await orderModel.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const usersByMonth = await userModel.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo }, role: 'user' } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const orderStatusBreakdown = await orderModel.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const topProducts = await productModel.find().sort({ ratingAvg: -1, createdAt: -1 }).limit(5);

        const monthlyChart = (arr, valueKey) => arr.map(d => ({
            label: `${MONTHS[d._id.month - 1]} ${String(d._id.year).slice(-2)}`,
            count: d.count,
            ...(valueKey ? { [valueKey]: d[valueKey] || 0 } : {})
        }));

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalCategories,
                totalRevenue
            },
            recentOrders,
            recentUsers,
            ordersByMonth: monthlyChart(ordersByMonth, 'revenue'),
            usersByMonth: monthlyChart(usersByMonth),
            orderStatusBreakdown,
            topProducts
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
