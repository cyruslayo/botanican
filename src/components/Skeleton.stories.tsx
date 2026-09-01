import { Skeleton, ProductCardSkeleton, AdminTableSkeleton } from './Skeleton';

export const Bare = () => (
  <div className="p-stack-md bg-surface">
    <Skeleton className="h-12 w-48 rounded-md" />
  </div>
);

export const ProductCard = () => (
  <div className="p-stack-md bg-surface">
    <div className="w-80">
      <ProductCardSkeleton />
    </div>
  </div>
);

export const AdminTable = () => (
  <div className="p-stack-md bg-surface">
    <div className="w-full max-w-3xl rounded-xl overflow-hidden border border-outline-variant/30">
      <AdminTableSkeleton rows={5} columns={5} />
    </div>
  </div>
);
