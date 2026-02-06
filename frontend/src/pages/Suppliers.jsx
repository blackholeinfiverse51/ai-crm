import React, { useEffect, useMemo, useState } from 'react';
import { 
  Building2,
  ChevronRight,
  ClipboardList,
  Clock,
  LayoutDashboard,
  Mail,
  Phone,
  Plus,
} from 'lucide-react';
import Card, { CardContent } from '@/components/common/ui/Card';
import Button from '@/components/common/ui/Button';
import Input from '@/components/common/forms/Input';
import Alert from '@/components/common/ui/Alert';
import Badge from '@/components/common/ui/Badge';
import MetricCard from '@/components/common/charts/MetricCard';
import LineChart from '@/components/common/charts/LineChart';
import BarChart from '@/components/common/charts/BarChart';
import PieChart from '@/components/common/charts/PieChart';
import { API_BASE_URL } from '@/utils/constants';

export const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // UI state (matches screenshot tabs)
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'current' | 'add'
  const [expandedSupplierId, setExpandedSupplierId] = useState(null);
  
  // Add supplier form state
  const [formData, setFormData] = useState({
    supplier_id: '',
    name: '',
    contact_email: '',
    contact_phone: '',
    lead_time_days: 7,
    is_active: true
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/procurement/suppliers`);
      if (!response.ok) throw new Error('Failed to load suppliers');
      const data = await response.json();
      setSuppliers(data.suppliers || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/procurement/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          supplier_id: formData.supplier_id.toUpperCase().trim()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create supplier');
      }
      
      setSuccess('Supplier created successfully!');
      resetForm();
      loadSuppliers();
      setActiveTab('current');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      name: '',
      contact_email: '',
      contact_phone: '',
      lead_time_days: 7,
      is_active: true
    });
  };

  const toggleExpanded = (supplierId) => {
    setExpandedSupplierId((prev) => (prev === supplierId ? null : supplierId));
  };

  const leadTimeControls = useMemo(() => {
    const dec = () => setFormData((p) => ({ ...p, lead_time_days: Math.max(1, (Number(p.lead_time_days) || 1) - 1) }));
    const inc = () => setFormData((p) => ({ ...p, lead_time_days: Math.min(365, (Number(p.lead_time_days) || 1) + 1) }));
    return { dec, inc };
  }, []);

  // Overview computed metrics + charts (based on loaded suppliers)
  const overview = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter((s) => s.is_active !== false).length;
    const inactive = total - active;
    const withEmail = suppliers.filter((s) => !!s.contact_email).length;
    const withPhone = suppliers.filter((s) => !!s.contact_phone).length;
    const avgLeadTime =
      total > 0
        ? Number(
            (
              suppliers.reduce((sum, s) => sum + (Number(s.lead_time_days) || 0), 0) /
              total
            ).toFixed(1)
          )
        : 0;

    const statusData = [
      { name: 'Active', value: active },
      { name: 'Inactive', value: inactive },
    ];

    const leadTimeData = suppliers
      .slice()
      .sort((a, b) => (Number(b.lead_time_days) || 0) - (Number(a.lead_time_days) || 0))
      .slice(0, 8)
      .map((s) => ({
        name: (s.name || s.supplier_id || 'Supplier').slice(0, 12),
        days: Number(s.lead_time_days) || 0,
      }));

    // Simple mock trend (until backend provides time-series). Scales with total suppliers.
    const base = Math.max(0, total - 6);
    const trendData = [
      { name: 'Aug', suppliers: base + 1 },
      { name: 'Sep', suppliers: base + 2 },
      { name: 'Oct', suppliers: base + 3 },
      { name: 'Nov', suppliers: base + 4 },
      { name: 'Dec', suppliers: base + 5 },
      { name: 'Jan', suppliers: total },
    ];

    return {
      total,
      active,
      inactive,
      withEmail,
      withPhone,
      avgLeadTime,
      statusData,
      leadTimeData,
      trendData,
    };
  }, [suppliers]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tabs (matches screenshot) */}
      <div className="flex items-center gap-6 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('current')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'current'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Current Suppliers
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'add'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
            <Plus className="h-4 w-4" />
            Add Supplier
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
              <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Supplier Overview</h1>
            <p className="text-muted-foreground mt-1">
              Summary metrics and performance indicators for your supplier network
            </p>
            </div>

          {loading ? (
            <div className="text-muted-foreground">Loading suppliers...</div>
          ) : (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Suppliers"
                  value={overview.total}
                  icon={Building2}
                  variant="primary"
                  trend="up"
                  trendValue="+4.1%"
                />
                <MetricCard
                  title="Active Suppliers"
                  value={overview.active}
                  icon={ClipboardList}
                  variant="success"
                  trend="up"
                  trendValue="+2.0%"
                />
                <MetricCard
                  title="Avg Lead Time"
                  value={`${overview.avgLeadTime} days`}
                  icon={Clock}
                  variant="warning"
                />
                <MetricCard
                  title="Contacts Available"
                  value={`${overview.withEmail}/${overview.withPhone}`}
                  icon={Mail}
                  variant="info"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChart title="Active vs Inactive" data={overview.statusData} height={320} />
                <LineChart
                  title="Suppliers Growth (Trend)"
                  data={overview.trendData}
                  lines={[{ dataKey: 'suppliers', name: 'Suppliers' }]}
                  height={320}
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <BarChart
                  title="Top Lead Times (days)"
                  data={overview.leadTimeData}
                  bars={[{ dataKey: 'days', name: 'Lead Time (days)' }]}
                  height={340}
                />
              </div>
            </>
          )}
            </div>
      )}

      {/* Current Suppliers */}
      {activeTab === 'current' && (
        <div className="space-y-4">
          <h1 className="text-3xl font-heading font-bold tracking-tight">Supplier Directory</h1>

          {loading ? (
            <div className="text-muted-foreground">Loading suppliers...</div>
          ) : suppliers.length === 0 ? (
            <Card className="border border-border">
              <CardContent className="p-6 text-muted-foreground">
                No suppliers found. Add your first supplier.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {suppliers.map((s) => {
                const isExpanded = expandedSupplierId === s.supplier_id;
                return (
                  <div key={s.supplier_id} className="border border-border rounded-lg bg-card shadow-xl">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(s.supplier_id)}
                      className="w-full flex items-center justify-between px-4 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">{s.name || s.supplier_id}</span>
                      </div>
                      <Badge variant={s.is_active ? 'success' : 'muted'}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-5 pt-0 border-t border-border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-sm">
                          <div className="space-y-2">
                            <div className="text-muted-foreground">Supplier ID</div>
                            <div className="font-mono">{s.supplier_id}</div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-muted-foreground">Lead Time</div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{s.lead_time_days ?? 7} days</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-muted-foreground">Contact Email</div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{s.contact_email || '—'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-muted-foreground">Contact Phone</div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{s.contact_phone || '—'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                        )}
                        </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Supplier */}
      {activeTab === 'add' && (
          <div className="space-y-4">
          <h1 className="text-3xl font-heading font-bold tracking-tight">Add New Supplier</h1>

          <Card className="border border-border">
            <CardContent className="p-6">
              <form onSubmit={handleAddSupplier} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                    label="Supplier ID*"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    placeholder="SUPPLIER_001"
                required
              />
              <Input
                label="Contact Phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+1-555-0123"
              />
            <Input
                    label="Company Name*"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="TechParts Supply Co."
                    required
            />

                  <div className="w-full">
                    <label className="block text-sm font-medium mb-2">Lead Time (days)</label>
            <div className="flex items-center gap-2">
              <input
                        type="number"
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.lead_time_days}
                        min={1}
                        max={365}
                        onChange={(e) => setFormData({ ...formData, lead_time_days: Number(e.target.value) || 1 })}
                      />
                      <Button type="button" variant="outline" size="icon" onClick={leadTimeControls.dec} aria-label="Decrease lead time">
                        -
                      </Button>
                      <Button type="button" variant="outline" size="icon" onClick={leadTimeControls.inc} aria-label="Increase lead time">
                        +
                      </Button>
            </div>
          </div>

              <Input
                label="Contact Email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="orders@company.com"
              />

                  <div className="flex items-center gap-3 pt-7">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-input"
              />
                    <span className="text-sm font-medium">Active</span>
            </div>
          </div>

                <div>
            <Button type="submit" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Supplier
            </Button>
          </div>
        </form>
            </CardContent>
          </Card>
              </div>
      )}
    </div>
  );
};

export default Suppliers;
