// src/components/parent/CalendarWidget.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const CalendarContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
    border-radius: 20px 20px 0 0;
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const CalendarTitle = styled.h3`
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CalendarControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const NavButton = styled.button`
  background: rgba(155, 89, 182, 0.1);
  border: 1px solid rgba(155, 89, 182, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  &:hover {
    background: rgba(155, 89, 182, 0.2);
    transform: translateY(-1px);
  }
`;

const MonthYear = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  min-width: 150px;
  text-align: center;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e9ecef;
  border-radius: 8px;
  overflow: hidden;
`;

const DayHeader = styled.div`
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  color: white;
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
`;

const DayCell = styled.div`
  background: ${props => props.isToday 
    ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' 
    : props.isSelected 
    ? 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)'
    : 'white'
  };
  color: ${props => props.isToday || props.isSelected ? 'white' : '#2c3e50'};
  padding: 1rem;
  min-height: 80px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &:hover {
    background: ${props => props.isToday 
      ? 'linear-gradient(135deg, #2980b9 0%, #1f618d 100%)' 
      : props.isSelected 
      ? 'linear-gradient(135deg, #8e44ad 0%, #7d3c98 100%)'
      : 'rgba(155, 89, 182, 0.1)'
    };
    transform: scale(1.02);
  }

  &.other-month {
    opacity: 0.3;
  }
`;

const DayNumber = styled.div`
  font-weight: 600;
  font-size: 1rem;
`;

const EventDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.color || '#e74c3c'};
  margin: 0 auto;
`;

const EventList = styled.div`
  margin-top: 2rem;
`;

const EventItem = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.color || '#9b59b6'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const EventTitle = styled.div`
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
`;

const EventTime = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
  background: rgba(155, 89, 182, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
`;

const EventDescription = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const EventType = styled.div`
  display: inline-block;
  background: ${props => props.color || '#9b59b6'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.5rem;
`;

const AddEventButton = styled.button`
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3);

  &:hover {
    background: linear-gradient(135deg, #8e44ad 0%, #7d3c98 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(155, 89, 182, 0.4);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #6c757d;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6c757d;
`;

export default function CalendarWidget({ 
  events = [], 
  onDateSelect,
  onEventClick,
  onAddEvent,
  loading = false,
  error = null 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isOtherMonth: true,
        events: []
      });
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === currentDay.toDateString();
      });

      days.push({
        date: currentDay,
        isOtherMonth: false,
        events: dayEvents
      });
    }

    // Jours du mois suivant
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isOtherMonth: true,
        events: []
      });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (day) => {
    setSelectedDate(day.date);
    if (onDateSelect) {
      onDateSelect(day.date);
    }
  };

  const getEventColor = (type) => {
    const colors = {
      'study_session': '#3498db',
      'break': '#f39c12',
      'goal': '#27ae60',
      'reward': '#e74c3c',
      'restriction': '#9b59b6',
      'custom': '#6c757d'
    };
    return colors[type] || '#6c757d';
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      'study_session': 'Session d\'étude',
      'break': 'Pause',
      'goal': 'Objectif',
      'reward': 'Récompense',
      'restriction': 'Restriction',
      'custom': 'Personnalisé'
    };
    return labels[type] || 'Événement';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  if (loading) {
    return (
      <CalendarContainer>
        <LoadingSpinner>Chargement du calendrier...</LoadingSpinner>
      </CalendarContainer>
    );
  }

  if (error) {
    return (
      <CalendarContainer>
        <div style={{ textAlign: 'center', color: '#e74c3c', padding: '2rem' }}>
          Erreur: {error}
        </div>
      </CalendarContainer>
    );
  }

  const days = getDaysInMonth(currentDate);
  const todayEvents = selectedDate 
    ? events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === selectedDate.toDateString();
      })
    : [];

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>📅 Calendrier Partagé</CalendarTitle>
        <CalendarControls>
          <NavButton onClick={() => navigateMonth(-1)}>
            ‹
          </NavButton>
          <MonthYear>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </MonthYear>
          <NavButton onClick={() => navigateMonth(1)}>
            ›
          </NavButton>
        </CalendarControls>
      </CalendarHeader>

      <CalendarGrid>
        {dayNames.map(day => (
          <DayHeader key={day}>{day}</DayHeader>
        ))}
        {days.map((day, index) => (
          <DayCell
            key={index}
            isToday={isToday(day.date)}
            isSelected={isSelected(day.date)}
            className={day.isOtherMonth ? 'other-month' : ''}
            onClick={() => handleDateClick(day)}
          >
            <DayNumber>{day.date.getDate()}</DayNumber>
            {day.events.slice(0, 3).map((event, eventIndex) => (
              <EventDot
                key={eventIndex}
                color={getEventColor(event.type)}
                title={event.title}
              />
            ))}
            {day.events.length > 3 && (
              <div style={{ 
                fontSize: '0.7rem', 
                color: 'rgba(0,0,0,0.6)',
                textAlign: 'center'
              }}>
                +{day.events.length - 3}
              </div>
            )}
          </DayCell>
        ))}
      </CalendarGrid>

      {selectedDate && (
        <EventList>
          <h4 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
            Événements du {selectedDate.toLocaleDateString('fr-FR')}
          </h4>
          {todayEvents.length > 0 ? (
            todayEvents.map((event, index) => (
              <EventItem
                key={index}
                color={getEventColor(event.type)}
                onClick={() => onEventClick && onEventClick(event)}
                style={{ cursor: 'pointer' }}
              >
                <EventHeader>
                  <EventTitle>{event.title}</EventTitle>
                  <EventTime>
                    {formatTime(event.startDate)}
                    {event.endDate && ` - ${formatTime(event.endDate)}`}
                  </EventTime>
                </EventHeader>
                {event.description && (
                  <EventDescription>{event.description}</EventDescription>
                )}
                <EventType color={getEventColor(event.type)}>
                  {getEventTypeLabel(event.type)}
                </EventType>
              </EventItem>
            ))
          ) : (
            <EmptyState>
              Aucun événement prévu pour cette date
            </EmptyState>
          )}
        </EventList>
      )}

      <AddEventButton onClick={() => onAddEvent && onAddEvent(selectedDate)}>
        + Ajouter un événement
      </AddEventButton>
    </CalendarContainer>
  );
}
