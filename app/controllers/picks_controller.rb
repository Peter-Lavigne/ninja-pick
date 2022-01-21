class PicksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_event
  before_action :set_pick, only: %i[ show edit update destroy ]
  
  # I may delete this controller entirely, but this will
  # prevent most people from accessing it
  before_action :check_organizer

  # GET /picks or /picks.json
  def index
    @picks = Pick.all
  end

  # GET /picks/1 or /picks/1.json
  def show
  end

  # GET /picks/new
  def new
    @pick = Pick.new
  end

  # GET /picks/1/edit
  def edit
  end

  # POST /picks or /picks.json
  def create
    @pick = Pick.new(
      placement: pick_params['placement'],
      ninja: Ninja.find_by(pick_params['ninja']),
      user: current_user,
      event: @event
    )

    respond_to do |format|
      if @pick.save
        format.html { redirect_to event_pick_url(@event, @pick), notice: "Pick was successfully created." }
        format.json { render :show, status: :created, location: @pick }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @pick.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /picks/1 or /picks/1.json
  def update
    update_pick_params = {
      placement: pick_params['placement'],
      ninja: Ninja.find_by(pick_params['ninja']),
      user: current_user,
      event: @event
    }

    respond_to do |format|
      if @pick.update(update_pick_params)
        format.html { redirect_to event_pick_url(@event, @pick), notice: "Pick was successfully updated." }
        format.json { render :show, status: :ok, location: @pick }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @pick.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /picks/1 or /picks/1.json
  def destroy
    @pick.destroy

    respond_to do |format|
      format.html { redirect_to event_picks_url(@event), notice: "Pick was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_pick
      @pick = Pick.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def pick_params
      params.require(:pick).permit(:placement, :ninja)
    end

    def set_event
      @event = Event.find(params[:event_id])
    end

    def check_organizer
      if !current_user.organizer?
        redirect_to root_url, notice: 'You must have organizer permissions to view that page.'
      end
    end
end
