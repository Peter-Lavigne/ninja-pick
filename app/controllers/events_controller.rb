class EventsController < ApplicationController
  before_action :authenticate_user!, except: %i[ show index ]
  before_action :check_organizer, only: %i[ new edit create update destroy ]
  before_action :set_event, only: %i[ show edit update destroy ]

  # GET /events or /events.json
  def index
    @events = Event.all
  end

  # GET /events/1 or /events/1.json
  def show
  end

  # GET /events/new
  def new
    @event = Event.new
  end

  # GET /events/1/edit
  def edit
  end

  # POST /events or /events.json
  def create
    @event = Event.new(event_params)

    ActiveRecord::Base.transaction do
      @event.save!
      update_ninjas(@event, ninja_params[:male], 'male')
      update_ninjas(@event, ninja_params[:female], 'female')
    end

    respond_to do |format|
      format.html { redirect_to event_url(@event), notice: "Event was successfully created." }
      format.json { render :show, status: :created, location: @event }
    end

  rescue Exception => ex
    respond_to do |format|
      format.html { render :new, status: :unprocessable_entity }
      format.json { render json: @event.errors, status: :unprocessable_entity }
    end
  end

  # PATCH/PUT /events/1 or /events/1.json
  def update
    ActiveRecord::Base.transaction do
      @event.update!(event_params)
      update_ninjas(@event, ninja_params[:male], 'male')
      update_ninjas(@event, ninja_params[:female], 'female')
    end

    respond_to do |format|
      format.html { redirect_to event_url(@event), notice: "Event was successfully created." }
      format.json { render :show, status: :created, location: @event }
    end

  rescue Exception => ex
    respond_to do |format|
      format.html { render :new, status: :unprocessable_entity }
      format.json { render json: @event.errors, status: :unprocessable_entity }
    end
  end

  # DELETE /events/1 or /events/1.json
  def destroy
    @event.destroy

    respond_to do |format|
      format.html { redirect_to events_url, notice: "Event was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_event
      @event = Event.find(params[:id])
    end

    def permitted_params
      params.require(:event).permit(
        :name,
        :finished,
        :ninjas_male,
        :ninjas_female
      )
    end

    # Only allow a list of trusted parameters through.
    def event_params
      {
        name: permitted_params[:name],
        finished: permitted_params[:finished],
        user: current_user
      }
    end

    def ninja_params
      {
        male: permitted_params[:ninjas_male].split("\n").reject(&:empty?),
        female: permitted_params[:ninjas_female].split("\n").reject(&:empty?),
      }
    end

    def update_ninjas(event, names, sex)
      event.ninjas.where(sex: sex).where.not(name: names).destroy_all
      (names - event.ninjas.where(sex: sex).pluck(:name)).each do |name|
        event.ninjas.create!(name: name, sex: sex)
      end

      if event.finished?
        names.each_with_index do |name, index|
          event.ninjas.find_by(sex: sex, name: name).update!(position: index)
        end
      end
    end

    def check_organizer
      if !current_user.organizer?
        redirect_to root_url, notice: 'You must have organizer permissions to view that page.'
      end
    end

    def index_params
      params.permit(:finished)
    end
end
