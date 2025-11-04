import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { mockFetch } from '../test-utils';

// Mock du hook useCourse
const useCourse = (courseId) => {
  const [course, setCourse] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`);
        const data = await response.json();
        setCourse(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  return { course, loading, error };
};

describe('useCourse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait charger un cours', async () => {
    const mockCourse = {
      _id: 'course1',
      name: 'Test Course',
      description: 'Test Description'
    };

    mockFetch({ success: true, course: mockCourse });

    const { result } = renderHook(() => useCourse('course1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.course).toEqual(mockCourse);
    expect(result.current.error).toBeNull();
  });

  it('devrait gérer les erreurs', async () => {
    mockFetch({ success: false, message: 'Course not found' }, 404);

    const { result } = renderHook(() => useCourse('nonexistent'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.course).toBeNull();
    expect(result.current.error).toBeDefined();
  });
});

