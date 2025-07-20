import { useUser } from '../../components/UserContext';
import JobSeekerHome from '../jobseekerhome';
import EmployerHomeScreen from '../employerhomescreen';
import { ActivityIndicator, View } from 'react-native';

export default function HomeTab() {
  const { user } = useUser();
  if (!user) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  if (user.type === 'jobseeker') return <JobSeekerHome />;
  return <EmployerHomeScreen />;
} 