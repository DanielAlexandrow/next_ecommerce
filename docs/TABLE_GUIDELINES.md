# Table Design Guidelines

## Structure and Layout

1. **Container Structure**
   ```tsx
   <div className="container mx-auto px-4 py-8">
     <h1 className="text-3xl font-bold text-center mb-8">{title}</h1>
     <div className="max-w-6xl mx-auto space-y-6">
       {/* Table content */}
     </div>
   </div>
   ```

2. **Table Wrapper**
   ```tsx
   <div className="bg-card rounded-lg shadow-sm p-6">
     <Table className="w-full text-center">
       {/* Table content */}
     </Table>
   </div>
   ```

## Header Design

1. **Column Headers**
   - Use `text-center` for alignment
   - Include sort indicators when applicable
   - Keep headers concise and clear
   ```tsx
   <TableHeader>
     <TableRow>
       <TableCell className="text-center">Column Name</TableCell>
     </TableRow>
   </TableHeader>
   ```

2. **Sortable Headers**
   - Use `SortableHeader` component for consistency
   - Include sort direction indicators
   ```tsx
   <SortableHeader
     label="Name"
     sortKey="name"
     sortConfig={sortConfig}
     getSortedUrl={getSortedUrl}
   />
   ```

## Table Body

1. **Row Structure**
   - Consistent cell alignment
   - Proper spacing
   ```tsx
   <TableBody>
     {items.map((item) => (
       <TableRow key={item.id}>
         <TableCell className="text-center">{item.name}</TableCell>
       </TableRow>
     ))}
   </TableBody>
   ```

2. **Action Cells**
   - Always use dropdown for multiple actions
   - Consistent button styling
   - Use red text for destructive actions
   ```tsx
   <TableCell className="text-center">
     <DropdownMenu>
       <DropdownMenuTrigger className="flex items-center gap-2">
         Open
       </DropdownMenuTrigger>
       <DropdownMenuContent>
         <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
         <DropdownMenuItem 
           onClick={handleDelete}
           className="text-red-600"
         >
           Delete
         </DropdownMenuItem>
       </DropdownMenuContent>
     </DropdownMenu>
   </TableCell>
   ```

## Modal Design

1. **Create/Edit Modals**
   ```tsx
   <Dialog>
     <DialogContent>
       <DialogHeader>
         <DialogTitle>Title</DialogTitle>
       </DialogHeader>
       <form className="space-y-4">
         {/* Form fields */}
         <div className="flex justify-end gap-2">
           <Button variant="outline">Cancel</Button>
           <Button type="submit">Submit</Button>
         </div>
       </form>
     </DialogContent>
   </Dialog>
   ```

2. **Delete/Destructive Modals**
   ```tsx
   <AlertDialog>
     <AlertDialogContent>
       <AlertDialogHeader>
         <AlertDialogTitle className="text-red-600">
           Are you sure?
         </AlertDialogTitle>
         <AlertDialogDescription>
           <span className="text-red-600">
             This action cannot be undone.
           </span>
           {/* Additional warning details */}
         </AlertDialogDescription>
       </AlertDialogHeader>
       <AlertDialogFooter>
         <AlertDialogCancel>Cancel</AlertDialogCancel>
         <AlertDialogAction 
           className="bg-red-600 hover:bg-red-700 text-white"
         >
           Delete
         </AlertDialogAction>
       </AlertDialogFooter>
     </AlertDialogContent>
   </AlertDialog>
   ```

## Functionality

1. **Search and Filters**
   - Place above table
   - Consistent spacing and alignment
   ```tsx
   <div className="flex justify-between items-center mb-6">
     <Input
       type="text"
       placeholder="Search..."
       className="max-w-md"
     />
     <Button>Add New</Button>
   </div>
   ```

2. **Pagination**
   - Place below table
   - Centered alignment
   ```tsx
   <div className="flex justify-center mt-4">
     <Paginate links={links} />
   </div>
   ```

## Color Patterns

1. **Action Colors**
   - Primary actions: Default button style
   - Secondary actions: `variant="outline"`
   - Destructive actions: Red variants
     - Text: `text-red-600`
     - Buttons: `bg-red-600 hover:bg-red-700`
     - Icons: `text-red-600`

2. **Status Colors**
   - Success: Green variants
   - Warning: Yellow variants
   - Error: Red variants
   - Info: Blue variants

## Best Practices

1. **Consistency**
   - Use same structure across all tables
   - Maintain consistent spacing
   - Use same action patterns
   - Follow color patterns for different action types

2. **Responsiveness**
   - Tables should be responsive
   - Consider mobile view behavior
   - Use appropriate text truncation

3. **Loading States**
   - Show loading indicators
   - Handle empty states gracefully
   - Provide error feedback

4. **Accessibility**
   - Proper ARIA labels
   - Keyboard navigation
   - Clear focus states
   - Color contrast for text

5. **Modal Patterns**
   - Clear titles indicating action
   - Consistent button placement
   - Proper warning messages for destructive actions
   - Color-coded elements for action type 