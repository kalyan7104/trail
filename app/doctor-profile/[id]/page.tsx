import DoctorProfile from './DoctorProfile';

export async function generateStaticParams() {
  return [
    { id: 'D001' },
    { id: 'D002' },
    { id: 'D003' },
    { id: 'D004' },
    { id: 'D005' },
  ];
}

export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  return <DoctorProfile doctorId={params.id} />;
}