import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/forms/Input';
import { Select } from '../components/forms/Select';
import { mockContacts, mockCompanies } from '../utils/mockData';
import { getStatusColor } from '../utils/helpers';
import { Contact } from '../types';

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState(mockContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    status: 'NEW' as Contact['status'],
    companyId: '',
  });

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  const statusOptions = [
    { value: 'NEW', label: 'New' },
    { value: 'QUALIFIED', label: 'Qualified' },
    { value: 'UNQUALIFIED', label: 'Unqualified' },
    { value: 'WON', label: 'Won' },
    { value: 'LOST', label: 'Lost' },
  ];

  const handleCreate = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      jobTitle: '',
      status: 'NEW',
      companyId: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      jobTitle: contact.jobTitle,
      status: contact.status,
      companyId: contact.companyId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (contactId: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingContact) {
      setContacts(prev => prev.map(contact =>
        contact.id === editingContact.id
          ? { ...contact, ...formData }
          : contact
      ));
    } else {
      const newContact: Contact = {
        id: Date.now().toString(),
        ...formData,
      };
      setContacts(prev => [...prev, newContact]);
    }

    setIsModalOpen(false);
  };

  const getCompanyName = (companyId: string) => {
    const company = mockCompanies.find(c => c.id === companyId);
    return company?.name || 'Unknown Company';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">Manage your contact relationships</p>
        </div>
        <Button icon={Plus} onClick={handleCreate}>
          Add Contact
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search contacts..."
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
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar
                        src={contact.avatarUrl}
                        name={contact.name}
                        size="md"
                        className="mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contact.name}
                        </div>
                        <div className="text-sm text-gray-500">{contact.email}</div>
                        <div className="text-sm text-gray-500">{contact.jobTitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCompanyName(contact.companyId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(contact.status) === 'green' ? 'success' : getStatusColor(contact.status) === 'red' ? 'danger' : 'default'}>
                      {contact.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
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
        title={editingContact ? 'Edit Contact' : 'Create Contact'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Job Title"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              required
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Contact['status'] })}
              options={statusOptions}
              required
            />
            <Select
              label="Company"
              name="companyId"
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              options={mockCompanies.map(company => ({ value: company.id, label: company.name }))}
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
              {editingContact ? 'Update Contact' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};