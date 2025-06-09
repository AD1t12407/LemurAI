import { Client } from '../types';
import { allMeetings } from './meetings';

// Sample client data
export const clients: Client[] = [
  {
    id: 'c1',
    name: 'SynaTech Solutions',
    industry: 'Technology',
    logo: 'https://images.pexels.com/photos/2653362/pexels-photo-2653362.jpeg?auto=compress&cs=tinysrgb&w=300',
    contacts: [
      {
        id: 'a1',
        name: 'Aman Sanghi',
        email: 'amansanghi@synatechsolutions.com',
        role: 'CTO',
        company: 'SynaTech Solutions'
      },
      {
        id: 'a3',
        name: 'Aditi Sharma',
        email: 'aditi@synatechsolutions.com',
        role: 'Product Manager',
        company: 'SynaTech Solutions'
      }
    ],
    meetings: allMeetings.filter(m => 
      m.attendees.some(a => 
        a.email.includes('synatechsolutions.com')
      )
    ),
    notes: 'Long-term client focused on digital transformation. Looking to improve their customer service platform with AI capabilities.'
  },
  {
    id: 'c2',
    name: 'Client Co',
    industry: 'Financial Services',
    logo: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=300',
    contacts: [
      {
        id: 'a4',
        name: 'John Client',
        email: 'john@client.com',
        role: 'Project Manager',
        company: 'Client Co'
      }
    ],
    meetings: allMeetings.filter(m => 
      m.attendees.some(a => 
        a.email.includes('client.com')
      )
    ),
    notes: 'New client interested in modernizing their legacy systems. Concerned about data security and compliance requirements.'
  }
];

// Get client by ID
export function getClientById(id: string): Client | undefined {
  return clients.find(client => client.id === id);
}