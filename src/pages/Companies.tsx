import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/forms/Input';
import { Select } from '../components/forms/Select';
import { mockCompanies, mockUsers } from '../utils/mockData';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Company } from '../types';

export const Companies: React.FC = () => {
  const [companies, setCompanies] = useState(mockCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    salesOwnerId: '',
    totalRevenue: '',
    companySize: '',
    businessType: '',
    industry: '',
    country: '',
    website: '',
  });

  const filteredCompanies = useMemo(() => {
    return companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  const companyOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ];

  const businessTypes = [
    { value: 'B2B', label: 'B2B' },
    { value: 'B2C', label: 'B2C' },
    { value: 'Enterprise', label: 'Enterprise' },
  ];

  const industries = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Software', label: 'Software' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
  ];

  const handleCreate = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      salesOwnerId: '',
      totalRevenue: '',
      companySize: '',
      businessType: '',
      industry: '',
      country: '',
      website: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      salesOwnerId: company.salesOwner.id,
      totalRevenue: company.totalRevenue.toString(),
      companySize: company.companySize,
      businessType: company.businessType,
      industry: company.industry,
      country: company.country,
      website: company.website,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (companyId: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      setCompanies(prev => prev.filter(company => company.id !== companyId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const salesOwner = mockUsers.find(user => user.id === formData.salesOwnerId);
    if (!salesOwner) return;

    if (editingCompany) {
      // Update existing company
      setCompanies(prev => prev.map(company => 
        company.id === editingCompany.id 
          ? {
              ...company,
              name: formData.name,
              salesOwner,
              totalRevenue: parseInt(formData.totalRevenue),
              companySize: formData.companySize,
              businessType: formData.businessType,
              industry: formData.industry,
              country: formData.country,
              website: formData.website,
              updatedAt: new Date().toISOString(),
            }
          : company
      ));
    } else {
      // Create new company
      const newCompany: Company = {
        id: Date.now().toString(),
        name: formData.name,
        salesOwner,
        totalRevenue: parseInt(formData.totalRevenue),
        companySize: formData.companySize,
        businessType: formData.businessType,
        industry: formData.industry,
        country: formData.country,
        website: formData.website,
        dealsAggregate: { sum: { value: 0 } },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCompanies(prev => [...prev, newCompany]);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">Manage your company relationships</p>
        </div>
        <Button icon={Plus} onClick={handleCreate}>
          Add Company
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open Deals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar
                        src={company.avatarUrl}
                        name={company.name}
                        size="md"
                        className="mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {company.name}
                        </div>
                        <div className="text-sm text-gray-500">{company.country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar
                        src={company.salesOwner.avatarUrl}
                        name={company.salesOwner.name}
                        size="sm"
                        className="mr-2"
                      />
                      <div className="text-sm text-gray-900">{company.salesOwner.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(company.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.industry}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(company.dealsAggregate.sum.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(company)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCompany ? 'Edit Company' : 'Create Company'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Select
              label="Sales Owner"
              name="salesOwnerId"
              value={formData.salesOwnerId}
              onChange={(e) => setFormData({ ...formData, salesOwnerId: e.target.value })}
              options={mockUsers.map(user => ({ value: user.id, label: user.name }))}
              required
            />
            <Input
              label="Total Revenue"
              name="totalRevenue"
              type="number"
              value={formData.totalRevenue}
              onChange={(e) => setFormData({ ...formData, totalRevenue: e.target.value })}
              required
            />
            <Select
              label="Company Size"
              name="companySize"
              value={formData.companySize}
              onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
              options={companyOptions}
              required
            />
            <Select
              label="Business Type"
              name="businessType"
              value={formData.businessType}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              options={businessTypes}
              required
            />
            <Select
              label="Industry"
              name="industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              options={industries}
              required
            />
            <Input
              label="Country"
              name="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
            />
            <Input
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingCompany ? 'Update Company' : 'Create Company'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};