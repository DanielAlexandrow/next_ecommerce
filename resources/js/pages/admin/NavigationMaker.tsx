import React, { useState, useEffect } from 'react';
import { Header, NavigationItem } from '@/types';
import { AdminLayout } from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DeleteHeaderNavigationModal from '@/components/Admin/NavigationMaker/DeleteHeaderNavigationModal';
import { toast } from 'react-hot-toast';
import useNavigationMakerStore from '@/stores/navigationmaker/navigationmakerstore';
import DeleteNavigationItemModal from '@/components/Admin/NavigationMaker/DeleteNavigationItemModal';
import navigationApi from '@/api/navigationApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function NavigationMaker() {
  const [isDeleteHeaderModalOpen, setIsDeleteHeaderModalOpen] = useState(false);
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
  const { headers, setHeaders, selectedHeader, setSelectedHeader, selectedNavigationItem, setSelectedNavigationItem } = useNavigationMakerStore();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    navigationApi.fetchNavData().then(data => {
      setHeaders(data.headers || []);
    });
  }, []);
  
  const handleLogout = async () => {
    try {
      await navigationApi.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  const { data: navData } = useQuery({
    queryKey: ['navigation'],
    queryFn: navigationApi.fetchNavData,
  });
  
  const saveNavigationMutation = useMutation({
    mutationFn: navigationApi.saveNavigation,
    onSuccess: () => {
      toast.success('Navigation saved successfully');
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
    },
    onError: () => {
      toast.error('Failed to save navigation');
    }
  });
  
  const handleSaveNavigation = () => {
    saveNavigationMutation.mutate(headers);
  };
  
  const handleDeleteHeader = () => {
    if (!selectedHeader) return;
    
    const updatedHeaders = headers.filter(header => header.id !== selectedHeader.id);
    setHeaders(updatedHeaders);
    setSelectedHeader(null);
    setIsDeleteHeaderModalOpen(false);
    toast.success(`Header "${selectedHeader.name}" deleted`);
  };
  
  const handleDeleteItem = () => {
    if (!selectedNavigationItem || !selectedHeader) return;
    
    const updatedHeaders = headers.map(header => {
      if (header.id === selectedHeader.id) {
        return {
          ...header,
          navigation_items: (header.navigation_items || []).filter(item => item.id !== selectedNavigationItem.id)
        };
      }
      return header;
    });
    
    setHeaders(updatedHeaders);
    setSelectedNavigationItem(null);
    setIsDeleteItemModalOpen(false);
    toast.success(`Navigation item "${selectedNavigationItem.name}" deleted`);
  };
  
  const handleMoveHeaderUp = (headerId: number) => {
    navigationApi.updateHeaderOrder(
      headers.map((h, i) => ({ ...h, order_num: i }))
    ).then(() => {
      toast.success('Header order updated');
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
    });
  };
  
  const handleMoveHeaderDown = (headerId: number) => {
    navigationApi.updateHeaderOrder(
      headers.map((h, i) => ({ ...h, order_num: i }))
    ).then(() => {
      toast.success('Header order updated');
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
    });
  };
  
  const handleEditHeader = (header: Header) => {
    setSelectedHeader(header);
  };
  
  const handleEditItem = (item: NavigationItem) => {
    setSelectedNavigationItem(item);
  };
  
  const handleMoveItemUp = (itemId: number, headerId: number) => {
    navigationApi.updateHeaderOrder(
      headers.map((h, i) => ({ 
        ...h, 
        order_num: i,
        navigation_items: h.navigation_items?.map((item, j) => ({ ...item, order_num: j }))
      }))
    ).then(() => {
      toast.success('Item order updated');
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
    });
  };
  
  const handleMoveItemDown = (itemId: number, headerId: number) => {
    navigationApi.updateHeaderOrder(
      headers.map((h, i) => ({ 
        ...h, 
        order_num: i,
        navigation_items: h.navigation_items?.map((item, j) => ({ ...item, order_num: j }))
      }))
    ).then(() => {
      toast.success('Item order updated');
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
    });
  };
  
  const handleUpdateHeader = (header: Header) => {
    navigationApi.updateHeader(header).then(() => {
      toast.success('Header updated');
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
    });
  };
  
  return (
    <div>
      <Head title="Navigation Maker" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold">Headers</h2>
            {headers.map((header) => (
              <div key={header.id} className="mt-4 p-2 border rounded">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{header.name}</h3>
                  <div>
                    <Button size="sm" variant="outline" onClick={() => handleMoveHeaderUp(header.id)}>Up</Button>
                    <Button size="sm" variant="outline" onClick={() => handleMoveHeaderDown(header.id)}>Down</Button>
                    <Button size="sm" variant="default" onClick={() => handleEditHeader(header)}>Edit</Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => {
                        setSelectedHeader(header);
                        setIsDeleteHeaderModalOpen(true);
                      }}>
                      Delete
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 pl-4">
                  {header.navigation_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-1 my-1 bg-gray-50 rounded">
                      <span>{item.name}</span>
                      <div>
                        <Button size="sm" variant="outline" onClick={() => handleMoveItemUp(item.id, header.id)}>Up</Button>
                        <Button size="sm" variant="outline" onClick={() => handleMoveItemDown(item.id, header.id)}>Down</Button>
                        <Button size="sm" variant="default" onClick={() => handleEditItem(item)}>Edit</Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => {
                            setSelectedNavigationItem(item);
                            setSelectedHeader(header);
                            setIsDeleteItemModalOpen(true);
                          }}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="mt-4">
              <Button onClick={handleSaveNavigation}>Save Navigation</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <DeleteHeaderNavigationModal 
        isOpen={isDeleteHeaderModalOpen}
        onClose={() => setIsDeleteHeaderModalOpen(false)}
        onDelete={handleDeleteHeader}
        headerName={selectedHeader?.name || ""}
      />
      
      <DeleteNavigationItemModal
        isOpen={isDeleteItemModalOpen}
        onClose={() => setIsDeleteItemModalOpen(false)}
        onDelete={handleDeleteItem}
        itemName={selectedNavigationItem?.name || ""}
      />
     
    </div>
  );
}

NavigationMaker.layout = (page: any) => <AdminLayout children={page} />;
