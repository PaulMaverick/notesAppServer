import express, { RequestHandler } from 'express';
import NoteModel from '../models/note';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import { getAuthenticatedUser } from './users';
import { authenticator } from '../util/authenticator';


export const getNotes: RequestHandler = async (req, res, next) => {
    const authenticatedUserId = req.session.userId
    console.log(req.session.userId)

    try {
        authenticator(authenticatedUserId) 

        const notes = await NoteModel.find({userId: authenticatedUserId}).exec();
        res.status(200).json(notes)
    } catch (error) {
        next(error);
    }
}

export const getNote: RequestHandler = async(req,res,next) => {
    const noteId = req.params.id
    const authenticatedUserId = req.session.userId

    console.log(authenticatedUserId, 'controller')
    try {
        authenticator(authenticatedUserId)

        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, "Invalid note id");
        }

        const note = await NoteModel.findById(noteId).exec();

        if(!note) {
            throw createHttpError(404, "Note not found")
        }

        if (!note.userId.equals(authenticatedUserId)){
            throw createHttpError(401, "Unauthorized")
        }

        res.status(200).json(note);
    } catch (error) {
        next(error);
    }
}

interface CreateNoteBody {
    title?: string,
    text?: string,
}


export const createNotes: RequestHandler<unknown, unknown, CreateNoteBody, unknown> = async(req, res, next) => {
    const { title, text } = req.body;
    const authenticatedUserId = req.session.userId
    try {
        authenticator(authenticatedUserId)

        if (!title) {
            throw createHttpError(400, "Note must have a title");
        }

        const newNote = await NoteModel.create({
            userId: authenticatedUserId,
            title: title,
            text: text,
        })
        res.status(201).json(newNote);
    } catch(error) {
        next(error)
    }
}

interface updateNoteParams {
    id: string
}

interface UpdateNoteBody {
    title?: string,
    text?: string,
}

export const updateNote: RequestHandler<updateNoteParams, unknown, UpdateNoteBody, unknown> = async(req, res, next) => {
    const noteId = req.params.id
    const { title, text } = req.body
    const authenticatedUserId = req.session.userId
    try {
        authenticator(authenticatedUserId)

        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, "Invalid note id");
        }

        if(!title) {
            throw createHttpError(400, "Note must have a title");
        }

        const note = await NoteModel.findById(noteId).exec();

        if(!note) {
            throw createHttpError(404, "Note note found")
        }

        if (!note.userId.equals(authenticatedUserId)){
            throw createHttpError(401, "Unauthorized")
        }

        note.title = title;
        note.text = text;

        const updatedNote = await note.save();

        res.status(200).json(updatedNote);
    } catch (error) {
        next(error);
    }
}

export const deleteNote: RequestHandler = async(req, res, next) => {
    const noteId = req.params.id
    const authenticatedUserId = req.session.userId
    try {
        authenticator(authenticatedUserId)

        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, "Invalid note id");
        }

        const note = await NoteModel.findById(noteId).exec();

        if(!note) {
            throw createHttpError(404, "Note not found");
        }

        if (!note.userId.equals(authenticatedUserId)){
            throw createHttpError(401, "Unauthorized")
        }

        await NoteModel.findByIdAndDelete(noteId).exec();
      
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
}