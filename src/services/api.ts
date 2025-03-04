import { Participant, ApiResponse } from '../types';

const API_URL = 'http://localhost:3001';

export const fetchParticipantById = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/participants?id=${id}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const participants: Participant[] = await response.json();
    
    if (participants.length === 0) {
      return {
        success: false,
        message: 'Participant not found'
      };
    }
    
    return {
      success: true,
      message: 'Participant found',
      data: participants[0]
    };
  } catch (error) {
    console.error('Error fetching participant:', error);
    return {
      success: false,
      message: 'Failed to fetch participant data. Please try again.'
    };
  }
};

export const checkInParticipant = async (id: string): Promise<ApiResponse> => {
  try {
    // First, get the current participant data
    const getResponse = await fetch(`${API_URL}/participants/${id}`);
    
    if (!getResponse.ok) {
      throw new Error('Network response was not ok');
    }
    
    const participant: Participant = await getResponse.json();
    
    if (participant.checked_in) {
      return {
        success: false,
        message: 'Participant already checked in',
        data: participant
      };
    }
    
    // Update the participant's check-in status
    const updatedParticipant = {
      ...participant,
      checked_in: true,
      check_in_time: new Date().toISOString()
    };
    
    const updateResponse = await fetch(`${API_URL}/participants/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedParticipant)
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to update participant');
    }
    
    const updatedData: Participant = await updateResponse.json();
    
    return {
      success: true,
      message: 'Check-in successful',
      data: updatedData
    };
  } catch (error) {
    console.error('Error checking in participant:', error);
    return {
      success: false,
      message: 'Failed to check in participant. Please try again.'
    };
  }
};