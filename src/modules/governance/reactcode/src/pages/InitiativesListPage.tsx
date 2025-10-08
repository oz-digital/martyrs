import { useState, useMemo } from 'react';
import { Plus, Target, Search, Filter } from 'lucide-react';
import InitiativeCard from '../components/InitiativeCard';
import CreateInitiativeForm from '../components/CreateInitiativeForm';
import EmptyState from '../components/EmptyState';
import { mockInitiatives } from '../data/mockData';

export default function InitiativesListPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [initiatives] = useState(mockInitiatives);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleCreateInitiative = (data: any) => {
    console.log('Creating product:', data);
    setShowCreateForm(false);
  };

  const filteredInitiatives = useMemo(() => {
    return initiatives.filter((initiative) => {
      const matchesSearch =
        searchQuery === '' ||
        initiative.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        initiative.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        initiative.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (initiative.slug && initiative.slug.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (initiative.team?.owners && initiative.team.owners.some((owner: any) =>
          owner.name.toLowerCase().includes(searchQuery.toLowerCase())
        ));

      const matchesStatus =
        statusFilter === 'all' || initiative.status === statusFilter;

      const matchesRisk =
        riskFilter === 'all' ||
        (initiative.metrics && initiative.metrics.riskIndex === riskFilter);

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [initiatives, searchQuery, statusFilter, riskFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage and track all your products</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Product
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by name, description, team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              {(statusFilter !== 'all' || riskFilter !== 'all') && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Active
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Risks</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setRiskFilter('all');
                      setSearchQuery('');
                    }}
                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {filteredInitiatives.length === 0 && initiatives.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">No products match your filters</p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setRiskFilter('all');
                setSearchQuery('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : filteredInitiatives.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No products yet"
            message="Get started by creating your first product to organize your work."
            actionText="Create Product"
            onAction={() => setShowCreateForm(true)}
          />
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredInitiatives.length} of {initiatives.length} products
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInitiatives.map((initiative) => (
                <InitiativeCard key={initiative.id} initiative={initiative} />
              ))}
            </div>
          </>
        )}

        {showCreateForm && (
          <CreateInitiativeForm
            onSubmit={handleCreateInitiative}
            onClose={() => setShowCreateForm(false)}
          />
        )}
      </div>
    </div>
  );
}
