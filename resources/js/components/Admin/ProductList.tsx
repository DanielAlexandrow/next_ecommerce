import React from 'react';
import { ProductListAdminProps } from '@/types/components';
import { Button } from '@/components/ui/button';

export default function ProductList({ products, onDelete, onEdit }: ProductListAdminProps) {
    const [deleteConfirm, setDeleteConfirm] = React.useState<number | null>(null);

    return (
        <div className="space-y-4">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                >
                    <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.description}</p>
                        <p className="text-sm font-medium">${product.price}</p>
                    </div>
                    <div className="flex gap-2">
                        {onEdit && (
                            <Button
                                onClick={() => onEdit(product)}
                                variant="secondary"
                            >
                                Edit
                            </Button>
                        )}
                        {onDelete && (
                            <>
                                {deleteConfirm === product.id ? (
                                    <>
                                        <Button
                                            onClick={() => onDelete(product.id)}
                                            variant="danger"
                                        >
                                            Confirm
                                        </Button>
                                        <Button
                                            onClick={() => setDeleteConfirm(null)}
                                            variant="secondary"
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => setDeleteConfirm(product.id)}
                                        variant="danger"
                                    >
                                        Delete
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
} 