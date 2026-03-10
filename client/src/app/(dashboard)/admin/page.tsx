'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Layers,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';

// Data moved inside component for translation
const data = [
  { name: 'Mon', sales: 4000, users: 2400 },
  { name: 'Tue', sales: 3000, users: 1398 },
  { name: 'Wed', sales: 2000, users: 9800 },
  { name: 'Thu', sales: 2780, users: 3908 },
  { name: 'Fri', sales: 1890, users: 4800 },
  { name: 'Sat', sales: 2390, users: 3800 },
  { name: 'Sun', sales: 3490, users: 4300 },
];

const categoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Fashion', value: 300 },
  { name: 'Home', value: 200 },
  { name: 'Beauty', value: 278 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const stats = [
    {
      name: t('users.stats.total'), // Reusing proper key if available or create new
      value: '$128,430',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      name: t('users.stats.active'),
      value: '45,231',
      change: '+3.2%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      name: 'New Orders', // Need a key for this if not in users.stats
      value: '1,342',
      change: '-5.1%',
      trend: 'down',
      icon: ShoppingCart,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      name: 'Conversion Rate',
      value: '4.8%',
      change: '+0.4%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
  ];

  const recentOrders = [
    {
      id: '#ORD-7234',
      customer: 'Alex Rivera',
      product: 'MacBook Pro M3',
      amount: '$2,499.00',
      status: 'Delivered',
      date: '2 mins ago',
    },
    {
      id: '#ORD-7235',
      customer: 'Sophie Chen',
      product: 'Sony WH-1000XM5',
      amount: '$349.00',
      status: 'Processing',
      date: '15 mins ago',
    },
    {
      id: '#ORD-7236',
      customer: 'Mark Thompson',
      product: 'Nike Air Max 270',
      amount: '$150.00',
      status: 'Shipped',
      date: '1 hour ago',
    },
    {
      id: '#ORD-7237',
      customer: 'Emma Wilson',
      product: 'iPhone 15 Pro',
      amount: '$999.00',
      status: 'Cancelled',
      date: '3 hours ago',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">
            {t('dashboard.title').split(' ')[0]}{' '}
            <span className="text-primary italic">
              {t('dashboard.title').split(' ').slice(1).join(' ')}
            </span>
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
            {t('dashboard.welcome', { name: user?.name })}{' '}
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />{' '}
            {t('dashboard.system_status')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-sm font-bold flex items-center gap-2 hover:bg-muted transition-all">
            <Clock className="h-4 w-4" /> {t('dashboard.actions.last_24h')}
          </button>
          <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all">
            {t('dashboard.actions.download_report')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={stat.name}
          >
            <Card className="border-border/40 bg-background/60 backdrop-blur-md overflow-hidden group hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn('p-2 rounded-xl', stat.bg)}>
                    <stat.icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-0.5 text-xs font-black px-2 py-1 rounded-full',
                      stat.trend === 'up'
                        ? 'text-primary bg-primary/10'
                        : 'text-rose-500 bg-rose-500/10',
                    )}
                  >
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    {stat.name}
                  </p>
                  <h3 className="text-2xl font-black tracking-tighter mt-1">
                    {stat.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border/40 bg-background/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black tracking-tight">
                {t('dashboard.sales.title')}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">
                {t('dashboard.sales.desc')}
              </p>
            </div>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </button>
          </CardHeader>
          <CardContent className="h-[350px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fontWeight: 600,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fontWeight: 600,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderRadius: '12px',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{
                    fontWeight: 800,
                    color: 'hsl(var(--primary))',
                    marginBottom: '4px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/40 bg-background/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-black tracking-tight">
              {t('dashboard.sales.category_title')}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium">
              {t('dashboard.sales.category_desc')}
            </p>
          </CardHeader>
          <CardContent className="h-[350px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fontWeight: 700,
                    fill: 'hsl(var(--foreground))',
                  }}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderRadius: '12px',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(var(--primary) / ${1 - index * 0.2})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Recent Orders & Inventory */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/40 bg-background/60 backdrop-blur-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <CardTitle className="text-lg font-black tracking-tight">
              {t('dashboard.orders.title')}
            </CardTitle>
            <button className="text-xs font-bold text-primary hover:underline">
              {t('dashboard.actions.view_all')}
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">
                      {t('dashboard.orders.customer')}
                    </th>
                    <th className="px-6 py-4">
                      {t('dashboard.orders.product')}
                    </th>
                    <th className="px-6 py-4">
                      {t('dashboard.orders.amount')}
                    </th>
                    <th className="px-6 py-4">
                      {t('dashboard.orders.status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                            {order.customer.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold tracking-tight">
                              {order.customer}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {order.date}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground/80">
                        {order.product}
                      </td>
                      <td className="px-6 py-4 font-black">{order.amount}</td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter',
                            order.status === 'Delivered'
                              ? 'bg-primary/10 text-primary'
                              : order.status === 'Processing'
                                ? 'bg-amber-500/10 text-amber-500'
                                : order.status === 'Shipped'
                                  ? 'bg-blue-500/10 text-blue-500'
                                  : 'bg-rose-500/10 text-rose-500',
                          )}
                        >
                          {t(`dashboard.orders.${order.status.toLowerCase()}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/40 bg-background/60 backdrop-blur-md overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tight">
                {t('dashboard.performance.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  name: t('dashboard.performance.server_load'),
                  value: 45,
                  color: 'bg-primary',
                },
                {
                  name: t('dashboard.performance.api_latency'),
                  value: 12,
                  color: 'bg-primary',
                },
                {
                  name: t('dashboard.performance.error_rate'),
                  value: 2,
                  color: 'bg-amber-500',
                },
              ].map((stat) => (
                <div key={stat.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-muted-foreground">
                      {stat.name}
                    </span>
                    <span className="font-black">{stat.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={cn(
                        'h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]',
                        stat.color,
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card className="border-border/40 bg-primary shadow-xl shadow-primary/20 text-primary-foreground">
              <CardContent className="p-6">
                <Layers className="h-8 w-8 mb-4 opacity-50" />
                <h4 className="text-sm font-bold uppercase tracking-widest opacity-80">
                  {t('dashboard.performance.storage_usage')}
                </h4>
                <p className="text-3xl font-black tracking-tighter mt-1">
                  84<span className="text-xl opacity-60">%</span>
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-background/60 backdrop-blur-md">
              <CardContent className="p-6">
                <BarChart3 className="h-8 w-8 mb-4 text-primary opacity-50" />
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  {t('dashboard.performance.active_sessions')}
                </h4>
                <p className="text-3xl font-black tracking-tighter mt-1">
                  1,204
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper for class names
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
