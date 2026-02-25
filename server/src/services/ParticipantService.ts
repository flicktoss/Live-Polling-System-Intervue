import { Server } from 'socket.io';

interface Participant {
  socketId: string;
  name: string;
  role: 'teacher' | 'student';
}

class ParticipantService {
  private participants: Map<string, Participant> = new Map();

  /**
   * Add a participant
   */
  addParticipant(socketId: string, name: string, role: 'teacher' | 'student'): void {
    this.participants.set(socketId, { socketId, name, role });
  }

  /**
   * Remove a participant
   */
  removeParticipant(socketId: string): void {
    this.participants.delete(socketId);
  }

  /**
   * Get a participant by socket ID
   */
  getParticipant(socketId: string): Participant | undefined {
    return this.participants.get(socketId);
  }

  /**
   * Get all participants
   */
  getAllParticipants(): Participant[] {
    return Array.from(this.participants.values());
  }

  /**
   * Get all students
   */
  getStudents(): Participant[] {
    return Array.from(this.participants.values()).filter((p) => p.role === 'student');
  }

  /**
   * Find an existing teacher participant
   */
  findTeacher(): Participant | undefined {
    return Array.from(this.participants.values()).find((p) => p.role === 'teacher');
  }

  /**
   * Check if a teacher can join (handles stale socket cleanup)
   * Returns null if the teacher can join, or an error message string if blocked
   */
  canTeacherJoin(io: Server): string | null {
    const existingTeacher = this.findTeacher();
    if (existingTeacher) {
      const existingSocket = io.sockets.sockets.get(existingTeacher.socketId);
      if (existingSocket && existingSocket.connected) {
        return 'A teacher is already in the session';
      }
      // Stale teacher socket — remove it
      this.removeParticipant(existingTeacher.socketId);
    }
    return null;
  }

  /**
   * Kick a student: validates, notifies, disconnects, and cleans up
   * Returns null on success, or an error message string on failure
   */
  kickStudent(
    requesterId: string,
    studentId: string,
    io: Server
  ): string | null {
    const requester = this.getParticipant(requesterId);
    if (!requester || requester.role !== 'teacher') {
      return 'Only teachers can kick students';
    }

    const student = this.getParticipant(studentId);
    if (!student) return 'Student not found';
    if (student.role !== 'student') return 'Cannot kick a teacher';

    // Notify and disconnect
    io.to(studentId).emit('kicked');
    this.removeParticipant(studentId);

    const studentSocket = io.sockets.sockets.get(studentId);
    if (studentSocket) {
      studentSocket.disconnect(true);
    }

    return null;
  }
}

export default new ParticipantService();
