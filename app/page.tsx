'use client'
import Layout from './components/Layout';

export default function Home(){
  return (
    <Layout>
      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold">Welcome to the Quiz</h2>
        <p className="mt-4">Try the 4-question quiz. Admins can manage questions via Admin area.</p>
      </div>
    </Layout>
  );
}
