import Loader from '@/components/ui/loader';

export default function Loading() {
    return (
    <div className='w-full h-screen flex items-center justify-center ' style={{ padding: '2rem' }}>
      <Loader />
    </div>
  );
}
