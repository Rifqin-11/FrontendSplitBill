'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Users, ArrowLeft, ArrowRight, User } from 'lucide-react';
import { Person } from '@/app/page';

interface PeopleManagerProps {
  people: Person[];
  setPeople: (people: Person[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const colors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export function PeopleManager({ people, setPeople, onNext, onBack }: PeopleManagerProps) {
  const [newPersonName, setNewPersonName] = useState('');

  const addPerson = () => {
    if (newPersonName.trim()) {
      const newPerson: Person = {
        id: Date.now().toString(),
        name: newPersonName.trim(),
        color: colors[people.length % colors.length],
      };
      setPeople([...people, newPerson]);
      setNewPersonName('');
    }
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(person => person.id !== id));
  };

  const updatePersonName = (id: string, name: string) => {
    setPeople(people.map(person =>
      person.id === id ? { ...person, name } : person
    ));
  };

  const addQuickPeople = () => {
    const quickNames = ['Me', 'Friend 1', 'Friend 2', 'Friend 3'];
    const newPeople = quickNames.map((name, index) => ({
      id: Date.now() + index + '',
      name,
      color: colors[index % colors.length],
    }));
    setPeople(newPeople);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Who&#39;s Splitting the Bill?</h2>
        <p className="text-gray-600">
          Add everyone who was part of this meal
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            People ({people.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {people.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No people added yet</p>
              <Button onClick={addQuickPeople} variant="outline">
                Add Sample Group (4 people)
              </Button>
            </div>
          )}

          {people.map((person, index) => (
            <div key={person.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: person.color }}
              >
                {person.name.charAt(0).toUpperCase()}
              </div>
              <Input
                value={person.name}
                onChange={(e) => updatePersonName(person.id, e.target.value)}
                className="flex-1"
                placeholder="Person name"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePerson(person.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex space-x-2">
            <Input
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              placeholder="Enter person's name"
              onKeyPress={(e) => e.key === 'Enter' && addPerson()}
              className="flex-1"
            />
            <Button onClick={addPerson} disabled={!newPersonName.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {people.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center space-x-2 mb-4">
                {people.map((person) => (
                  <div
                    key={person.id}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: person.color }}
                  >
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
              <p className="text-gray-600">
                Ready to split the bill between {people.length} {people.length === 1 ? 'person' : 'people'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Edit
        </Button>
        <Button
          onClick={onNext}
          className="flex-1"
          disabled={people.length === 0}
        >
          Assign Items
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
