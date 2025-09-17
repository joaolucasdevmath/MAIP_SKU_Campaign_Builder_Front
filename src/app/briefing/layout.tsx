import Navbar from 'src/components/navbar';

export default function BriefingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ marginTop: 64 }}>{children}</main>
    </>
  );
}
