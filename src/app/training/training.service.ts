import { Exercise } from "./exercise.model";
import { Subject } from 'rxjs';
import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { UIService } from "../shared/ui-service";

@Injectable()
export class TrainingService {
  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();
  private availableExercises: Exercise[] = [];
  private runningExercise: Exercise;
  private firestoreSubscriptions: Subscription[] = [];

  constructor(private firestore: AngularFirestore, private uiService: UIService) { }

  fetchAvailableExercises() {
    this.uiService.loadingStateChanged.next(true);
    this.firestoreSubscriptions.push(this.firestore.collection('availableExercises').snapshotChanges()
      .pipe(map(docArray => {
        return docArray.map(doc => {
          return {
            id: doc.payload.doc.id,
            name: doc.payload.doc.data()['name'],
            duration: doc.payload.doc.data()['duration'],
            calories: doc.payload.doc.data()['calories'],
            // ...doc.payload.doc.data() as Exercise
          }
        });
      })).subscribe((exercises: Exercise[]) => {
        this.uiService.loadingStateChanged.next(false);
        this.availableExercises = exercises;
        this.exercisesChanged.next([...this.availableExercises])
      }, error => {
        this.uiService.loadingStateChanged.next(false);
        this.uiService.showSnackbar("Fetching exercises failed. Please try again", null, {
          duration: 3000
        });
        this.exercisesChanged.next(null);
      }));
  }

  startExercise(selectedId: string) {
    this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
    this.exerciseChanged.next({ ...this.runningExercise });
  }

  getRunningExercise() {
    return { ...this.runningExercise };
  }

  completeExercise() {
    this.addDataToDatabase({ ...this.runningExercise, date: new Date, state: 'completed' });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      date: new Date,
      state: 'cancelled'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  fetchCompletedOrCancelledExercises() {
    this.firestoreSubscriptions.push(this.firestore.collection('finishedEcercises').valueChanges().subscribe((exercises: Exercise[]) => {
      this.finishedExercisesChanged.next(exercises);
      console.log(exercises, 'fetch exercise');
    }));
  }

  cancelSubscriptions() {
    this.firestoreSubscriptions.forEach(sub => sub.unsubscribe());
  }

  private addDataToDatabase(exercise: Exercise) {
    this.firestore.collection('finishedExercises').add(exercise);
  }
}
