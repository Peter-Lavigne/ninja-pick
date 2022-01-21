class AddFinishedToEvents < ActiveRecord::Migration[7.0]
  def change
    add_column :events, :finished, :boolean, null: false, default: false
  end
end
