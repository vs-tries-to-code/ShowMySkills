import { signupConfig } from '@/config/signupConfig';
import { Signup } from '@/components/Signup';
import { notFound, redirect } from 'next/navigation';

export function generateStaticParams() {
  return Object.keys(signupConfig).map((role) => ({ role }));
}

export default async function Page({ params }) {
  const { role } = await params; // Next.js 15 params unwrapping

  if (role === 'admin') {
    redirect('/signup?role=admin');
  }

  if (role === 'student') {
    redirect('/signup?role=student');
  }

  const config = signupConfig[role];

  if (!config) {
    notFound(); // Triggers 404 if someone types an invalid role in the URL
  }

  return <Signup role={role} config={config} />;
}