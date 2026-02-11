import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Icons } from '../components/ui/icons';
import ComplaintForm from '../components/ComplaintForm';

export default function NewComplaint() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/complaints">
            <Icons.chevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">New Complaint</h1>
          <p className="text-muted-foreground">
            Report an issue in your area. Select a location on the map and fill in the details.
          </p>
        </div>
      </div>
      <ComplaintForm
        onSuccess={() => {
          navigate('/complaints');
        }}
      />
    </div>
  );
}
