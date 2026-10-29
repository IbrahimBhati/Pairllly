import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { ListingCard } from '../components/listings/ListingCard';
import { ListingActions } from '../components/listings/ListingActions';
import { EmptyState } from '../components/ui/EmptyState';
import { ListingsService } from '../lib/services/listingsService';
import { useAuth } from '../context/AuthContext';
import { Plus, Layers, Filter } from 'lucide-react';
import type { Listing, ListingStatus } from '../types/database';

export interface MyListingsPageProps {
  onNavigate: (path: string) => void;
}

export const MyListingsPage: React.FC<MyListingsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | ListingStatus>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadListings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await ListingsService.getMyListings(user.id);
      setListings(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [user]);

  const handleStatusChange = async (listingId: string, newStatus: ListingStatus) => {
    if (!user) return;
    await ListingsService.setListingStatus(listingId, user.id, newStatus);
    await loadListings();
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!user) return;
    await ListingsService.deleteListing(listingId, user.id);
    await loadListings();
  };

  const filteredListings = listings.filter((l) => {
    if (statusFilter === 'all') return true;
    return l.status === statusFilter;
  });

  const counts = {
    all: listings.length,
    published: listings.filter((l) => l.status === 'published').length,
    draft: listings.filter((l) => l.status === 'draft').length,
    paused: listings.filter((l) => l.status === 'paused').length,
    closed: listings.filter((l) => l.status === 'closed').length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        title="My Listings"
        description="Create, publish, pause, and manage your peer knowledge exchange offerings and learning requests."
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigate('/listings/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Listing
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => onNavigate('/dashboard') },
          { label: 'My Listings' },
        ]}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[#E2E8F0]">
        {[
          { id: 'all', label: 'All Listings', count: counts.all },
          { id: 'published', label: 'Published', count: counts.published },
          { id: 'draft', label: 'Drafts', count: counts.draft },
          { id: 'paused', label: 'Paused', count: counts.paused },
          { id: 'closed', label: 'Closed', count: counts.closed },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id as any)}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === tab.id
                ? 'bg-[#4B3F72] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#1F2937] hover:bg-[#F1F5F9]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#64748B]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Listing Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isOwner={true}
              onViewDetails={(id) => onNavigate(`/listings/${id}`)}
              actions={
                <ListingActions
                  listing={listing}
                  onStatusChange={(newStatus) => handleStatusChange(listing.id, newStatus)}
                  onEdit={() => onNavigate(`/listings/${listing.id}/edit`)}
                  onDelete={() => handleDeleteListing(listing.id)}
                />
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Layers className="w-6 h-6" />}
          title={
            statusFilter === 'all'
              ? 'No listings created yet'
              : `No ${statusFilter} listings`
          }
          description="Listings connect your offered and wanted skills with specific session formats, duration, and collaborative details."
          actionLabel="Create Your First Listing"
          onAction={() => onNavigate('/listings/new')}
        />
      )}
    </div>
  );
};
